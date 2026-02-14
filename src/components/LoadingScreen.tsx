import React from "react";

type Mode = "boot" | "welcome";

type Props = {
  mode?: Mode;

  // Images are served from /public/images → /images/...
  // You can pass "welcome-bg.jpg" or "/images/welcome-bg.jpg"
  background?: string;

  // Boot-only: optional centered GIF (e.g., "initial-loading.gif")
  centerGif?: string;

  // Boot-only: small label shown near bottom center (e.g., "Starting Windows…")
  label?: string;

  // Welcome-only: big centered XP-like text (e.g., "Welcome")
  welcomeText?: string;

  // Optional version text in bottom-left (e.g., "ShaunOS v1.5")
  versionText?: string;
};

/**
 * Build a public URL that works in dev + production even when deployed under a sub-path.
 * Vite serves /public/* at the web root. So /public/images/foo.jpg becomes /images/foo.jpg.
 */
function publicImg(pathOrFile: string) {
  const base = (import.meta as any).env?.BASE_URL || "/";

  const p = pathOrFile.startsWith("/")
    ? pathOrFile
    : `/images/${pathOrFile.replace(/^images\//, "")}`;

  return `${base.replace(/\/$/, "")}${p}`;
}

export default function LoadingScreen({
  mode = "boot",
  background = mode === "boot" ? "boot-bg.jpg" : "welcome-bg.jpg",
  centerGif,
  label = "Starting Windows…",
  welcomeText = "Welcome",
  versionText,
}: Props) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Background */}
      <img
        src={publicImg(background)}
        alt={mode === "boot" ? label : welcomeText}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* BOOT: centered GIF (optional) */}
      {mode === "boot" && centerGif && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={publicImg(centerGif)}
            alt=""
            className="w-[240px] h-auto"
            draggable={false}
          />
        </div>
      )}

      {/* WELCOME: big centered XP-like text */}
      {mode === "welcome" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="select-none"
            style={{
              fontFamily: "Tahoma, Verdana, Arial, sans-serif",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: "rgba(255,255,255,0.95)",
              textShadow:
                "0 2px 0 rgba(0,0,0,0.55), 0 10px 28px rgba(0,0,0,0.55)",
            }}
          >
            {welcomeText}
          </div>
        </div>
      )}

      {/* BOOT: small label near bottom center */}
      {mode === "boot" && !!label && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <span
            className="select-none"
            style={{
              fontFamily: "Tahoma, Verdana, Arial, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 1px 2px rgba(0,0,0,0.75)",
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Version text (bottom-left) */}
      {!!versionText && (
        <div className="absolute bottom-8 left-6 select-none">
          <span
            style={{
              fontFamily: "Tahoma, Verdana, Arial, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 2px rgba(0,0,0,0.7)",
              letterSpacing: 0.2,
            }}
          >
            {versionText}
          </span>
        </div>
      )}
    </div>
  );
}
