import React, { useEffect, useRef, useState } from "react";
import { Window } from "./components/Window";
import { Taskbar } from "./components/Taskbar";
import { DesktopIcon } from "./components/DesktopIcon";
import { AboutWindow } from "./components/windows/AboutWindow";
import { ProjectsWindow } from "./components/windows/ProjectsWindow";
import { ExperienceWindow } from "./components/windows/ExperienceWindow";
import { ContactWindow } from "./components/windows/ContactWindow";
import portfolioData from "./data/portfolio.json";

import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/LoginScreen";
import WelcomeToast from "./components/WelcomeToast";
import { APP_NAME, APP_VERSION } from "./version";

interface OpenWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  position?: { x: number; y: number };
  z: number;
}

type Phase = "boot" | "login" | "welcome" | "desktop";

function App() {
  // Tunables
  const BOOT_MS = 5500; // boot screen duration
  const WELCOME_MS = 1800; // welcome loading screen duration
  const FADE_MS = 350; // fade transition duration

  const [phase, setPhase] = useState<Phase>("boot");
  const [fadeOpacity, setFadeOpacity] = useState(0);

  // Windows
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  // Desktop icon selection (single click select, drag to lasso select)
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const desktopRef = useRef<HTMLDivElement | null>(null);

  // System tray info anchor (for toast positioning)
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const [infoAnchorRect, setInfoAnchorRect] = useState<DOMRect | null>(null);

  // Welcome toast visibility (desktop only)
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);

  // Selection rectangle
  const [selectionBox, setSelectionBox] = useState<
    null | { startX: number; startY: number; x: number; y: number; w: number; h: number }
  >(null);

  // Audio unlock
  const audioUnlocked = useRef(false);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const nextZ = (wins: OpenWindow[]) =>
    wins.length ? Math.max(...wins.map((w) => w.z || 0)) + 1 : 21;

  const assetUrl = (path: string) => {
    const base = (import.meta as any).env?.BASE_URL || "/";
    if (!path) return path;
    if (path.startsWith("/")) return `${base}${path.replace(/^\//, "")}`;
    return path;
  };

  const playSound = (path: string, volume = 0.6) => {
    try {
      const audio = new Audio(assetUrl(path));
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {}
  };

  const unlockAudioOnce = () => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    try {
      const a = new Audio(assetUrl("/sound/pop.mp3"));
      a.volume = 0;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
        })
        .catch(() => {
          audioUnlocked.current = false;
        });
    } catch {
      audioUnlocked.current = false;
    }
  };

  const FadeOverlay = () => (
    <div
      className="fixed inset-0 z-[10000] bg-black pointer-events-none"
      style={{
        opacity: fadeOpacity,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    />
  );

  const fadeTo = async (to: number) => {
    setFadeOpacity(to);
    await new Promise((r) => window.setTimeout(r, FADE_MS));
  };

  // ---------------------------------------------------------------------------
  // Global: disable right-click context menu
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onCtx = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", onCtx);
    return () => window.removeEventListener("contextmenu", onCtx);
  }, []);

  // ---------------------------------------------------------------------------
  // Title
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const suffix = phase === "desktop" ? "" : ` — ${phase.toUpperCase()}`;
    document.title = `${APP_NAME} v${APP_VERSION}${suffix}`;
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Boot -> Login (simple timer)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "boot") return;

    const t = window.setTimeout(() => {
      setPhase("login");
    }, BOOT_MS);

    return () => window.clearTimeout(t);
  }, [phase, BOOT_MS]);

  // ---------------------------------------------------------------------------
  // Keep tray anchor rect updated (desktop only)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "desktop") return;

    const update = () => {
      const el = infoButtonRef.current;
      setInfoAnchorRect(el ? el.getBoundingClientRect() : null);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Desktop welcome balloon rules (exact):
  // - Desktop loads: no balloons
  // - After 3s: show balloon + pop
  // - Hide after 5s
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "desktop") return;

    setShowWelcomeToast(false);

    const showT = window.setTimeout(() => {
      setShowWelcomeToast(true);
      playSound("/sound/pop.mp3", 0.45);
    }, 3000);

    const hideT = window.setTimeout(() => {
      setShowWelcomeToast(false);
    }, 3000 + 5000);

    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(hideT);
    };
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const restartBoot = async () => {
    setOpenWindows([]);
    setActiveWindow(null);
    setSelectedIconIds(new Set());
    setShowWelcomeToast(false);

    await fadeTo(1);
    setPhase("boot");
    await fadeTo(0);
  };

  const goLogin = async () => {
    setOpenWindows([]);
    setActiveWindow(null);
    setSelectedIconIds(new Set());
    setShowWelcomeToast(false);

    await fadeTo(1);
    setPhase("login");
    await fadeTo(0);
  };

  const onLogin = async () => {
    unlockAudioOnce();

    await fadeTo(1);
    setPhase("welcome");
    await fadeTo(0);

    window.setTimeout(async () => {
      await fadeTo(1);
      setPhase("desktop");
      await fadeTo(0);
    }, WELCOME_MS);
  };

  // ---------------------------------------------------------------------------
  // Window management
  // ---------------------------------------------------------------------------
  const focusWindow = (id: string) => {
    setOpenWindows((prev) => {
      const z = nextZ(prev);
      return prev.map((w) => (w.id === id ? { ...w, z } : w));
    });
    setActiveWindow(id);
  };

  const openWindow = (id: string) => {
    setSelectedIconIds(new Set([id]));

    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.id === id);
      if (exists) {
        const z = nextZ(prev);
        return prev.map((w) => (w.id === id ? { ...w, z } : w));
      }

      const windowConfigs: Record<string, Omit<OpenWindow, "id" | "z">> = {
        about: {
          title: "About Me",
          icon: <img src="images/mypc.ico" alt="About Me" className="w-4 h-4" />,
          component: <AboutWindow data={portfolioData} />,
          position: { x: 100, y: 5 },
        },
        experience: {
          title: "Experience & Education",
          icon: <img src="images/world.ico" alt="Experience & Education" className="w-4 h-4" />,
          component: (
            <ExperienceWindow
              experience={portfolioData.experience}
              education={portfolioData.education}
            />
          ),
          position: { x: 200, y: 20 },
        },
        projects: {
          title: "My Projects",
          icon: <img src="images/folder.ico" alt="My Projects" className="w-4 h-4" />,
          component: <ProjectsWindow projects={portfolioData.projects} />,
          position: { x: 300, y: 35 },
        },
        contact: {
          title: "Contact",
          icon: <img src="images/phone.ico" alt="Contact" className="w-4 h-4" />,
          component: <ContactWindow data={portfolioData.personal} />,
          position: { x: 400, y: 55 },
        },
      };

      const config = windowConfigs[id];
      if (!config) return prev;

      const z = nextZ(prev);
      return [...prev, { id, ...config, z }];
    });

    setActiveWindow(id);
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => {
      const next = prev.filter((w) => w.id !== id);
      const top = next.length ? next.reduce((a, b) => (a.z > b.z ? a : b)) : null;
      setActiveWindow(top ? top.id : null);
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Desktop lasso selection
  // ---------------------------------------------------------------------------
  const intersects = (a: DOMRect, b: DOMRect) =>
    !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  const beginDesktopSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "desktop") return;
    if (e.button !== 0) return;

    const t = e.target as HTMLElement;
    if (t.closest('[data-no-desktop-select="true"]')) return;

    const host = desktopRef.current;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    const startX = e.clientX - hostRect.left;
    const startY = e.clientY - hostRect.top;

    let moved = false;
    setSelectedIconIds(new Set());
    setSelectionBox({ startX, startY, x: startX, y: startY, w: 0, h: 0 });

    const onMove = (me: MouseEvent) => {
      const curX = me.clientX - hostRect.left;
      const curY = me.clientY - hostRect.top;
      const x1 = Math.min(startX, curX);
      const y1 = Math.min(startY, curY);
      const x2 = Math.max(startX, curX);
      const y2 = Math.max(startY, curY);
      const w = x2 - x1;
      const h = y2 - y1;
      if (w > 2 || h > 2) moved = true;

      setSelectionBox({ startX, startY, x: x1, y: y1, w, h });

      const selViewport = new DOMRect(hostRect.left + x1, hostRect.top + y1, w, h);

      const ids: string[] = [];
      for (const [id, el] of Object.entries(iconRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (intersects(selViewport, r)) ids.push(id);
      }
      setSelectedIconIds(new Set(ids));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      if (!moved) setSelectedIconIds(new Set());
      setSelectionBox(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------
  if (phase === "boot") {
    return (
      <>
        <LoadingScreen
          mode="boot"
          background="boot-bg.jpg"
          centerGif="initial-loading.gif"
          label="Starting Windows…"
          versionText={`${APP_NAME} v${APP_VERSION}`}
        />
        <FadeOverlay />
      </>
    );
  }

  if (phase === "login") {
    return (
      <>
        <LoginScreen
          fullname={portfolioData.personal.fullname}
          title={portfolioData.personal.title}
          avatar={portfolioData.personal.avatar}
          onLogin={onLogin}
          onShutdown={restartBoot}
        />
        <FadeOverlay />
      </>
    );
  }

  if (phase === "welcome") {
    return (
      <>
        <LoadingScreen
          mode="welcome"
          background="welcome-bg.jpg"
          welcomeText="Welcome"
          versionText={`${APP_NAME} v${APP_VERSION}`}
        />
        <FadeOverlay />
      </>
    );
  }

  // DESKTOP
  return (
    <>
      <div
        ref={desktopRef}
        onMouseDown={beginDesktopSelection}
        className="min-h-screen xp-desktop relative overflow-hidden font-tahoma selection:bg-[#0b61ff] selection:text-white"
      >
        {/* Background Image */}
        <div className="fixed inset-0 pb-[30px] pointer-events-none">
          <img
            src="images/wallpaper.jpg"
            alt="Desktop Background"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Desktop Icons */}
        <div
          className="relative z-10 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit content-start h-[calc(100vh-40px)]"
          data-no-desktop-select="true"
        >
          {[
            { id: "about", label: "About Me", icon: <img src="images/mypc.ico" alt="About Me" className="w-10 h-10" /> },
            { id: "experience", label: "Experience & Education", icon: <img src="images/world.ico" alt="Experience" className="w-10 h-10" /> },
            { id: "projects", label: "My Projects", icon: <img src="images/folder.ico" alt="Projects" className="w-10 h-10" /> },
            { id: "contact", label: "Contact", icon: <img src="images/phone.ico" alt="Contact" className="w-10 h-10" /> },
          ].map((item) => (
            <DesktopIcon
              key={item.id}
              id={item.id}
              ref={(el) => {
                iconRefs.current[item.id] = el;
              }}
              icon={item.icon}
              label={item.label}
              selected={selectedIconIds.has(item.id)}
              onSelect={(id) => setSelectedIconIds(new Set([id]))}
              onOpen={(id) => openWindow(id)}
            />
          ))}
        </div>

        {/* Desktop selection box */}
        {selectionBox && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.w,
              height: selectionBox.h,
              border: "1px dotted #ffffff",
              background: "rgba(11, 97, 255, 0.2)",
              outline: "1px solid rgba(11, 97, 255, 0.4)",
            }}
          />
        )}

        {/* Windows layer */}
        <div className="absolute inset-0 z-20 pointer-events-none" data-no-desktop-select="true">
          {openWindows.map((w) => (
            <div
              key={w.id}
              className="pointer-events-auto"
              style={{ zIndex: w.z }}
              onMouseDown={() => focusWindow(w.id)}
            >
              <Window
                title={w.title}
                icon={w.icon}
                onClose={() => closeWindow(w.id)}
                initialPosition={w.position}
              >
                {w.component}
              </Window>
            </div>
          ))}
        </div>

        {/* Taskbar */}
        <div data-no-desktop-select="true">
          <Taskbar
            data={{
              fullname: portfolioData.personal.fullname,
              avatar: portfolioData.personal.avatar,
            }}
            openWindows={openWindows}
            activeWindow={activeWindow}
            onWindowClick={focusWindow}
            onStartMenuClick={openWindow}
            onLogOff={goLogin}
            onShutdown={restartBoot}
            infoButtonRef={infoButtonRef}
            infoTooltipText="Click to view 'Welcome'"
            onInfoClick={() => {
              setShowWelcomeToast(true);
              playSound("/sound/pop.mp3", 0.45);
            }}
          />
        </div>

        {/* Welcome balloon */}
        <div data-no-desktop-select="true">
          <WelcomeToast
            open={showWelcomeToast}
            anchorRect={infoAnchorRect}
            autoCloseMs={5000}
            onClose={() => setShowWelcomeToast(false)}
            name={portfolioData.personal.fullname.split(" ")[0] || portfolioData.personal.fullname}
            iconSrc="images/info.ico"
          />
        </div>
      </div>

      <FadeOverlay />
    </>
  );
}

export default App;
