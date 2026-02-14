import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type WelcomeToastProps = {
  /** Show/hide the toast */
  open: boolean;
  /** Called when toast should be dismissed (timeout or user click) */
  onClose: () => void;
  /** Name to show in the message */
  name: string;
  /** Optional: small icon shown on the left (e.g. favicon/XP icon) */
  iconSrc?: string;
  /** Auto-dismiss after this many ms (default 4500) */
  autoCloseMs?: number;
  /** Optional anchor rectangle for positioning above the tray icon */
  anchorRect?: DOMRect | null;
};

/**
 * Lightweight XP-ish "balloon" toast.
 * Lives on the desktop layer, near the system tray.
 */
const WelcomeToast: React.FC<WelcomeToastProps> = ({
  open,
  onClose,
  name,
  iconSrc = "images/info.ico",
  autoCloseMs = 4500,
  anchorRect = null,
}) => {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, autoCloseMs);
    return () => window.clearTimeout(t);
  }, [open, autoCloseMs, onClose]);


  const toastRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; tailX: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const compute = () => {
      const btn = toastRef.current;
      if (!btn) return;

      const w = btn.offsetWidth || 320;
      const h = btn.offsetHeight || 90;

      // Default: bottom-right above taskbar.
      let left = window.innerWidth - w - 10;
      let top = window.innerHeight - 38 - h - 8;
      let tailX = w - 40;

      if (anchorRect) {
        const anchorCenterX = anchorRect.left + anchorRect.width / 2;
        const anchorTop = anchorRect.top;

        // Place toast above the tray icon (XP-like)
        left = Math.round(anchorCenterX - w + 28);
        top = Math.round(anchorTop - h - 14);

        // Clamp to viewport.
        left = Math.max(10, Math.min(window.innerWidth - w - 10, left));
        top = Math.max(10, Math.min(window.innerHeight - h - 48, top));

        // Tail should point to the center of the icon.
        tailX = Math.round(anchorCenterX - left);
        tailX = Math.max(22, Math.min(w - 22, tailX));
      }

      setPos({ left, top, tailX });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [open, anchorRect]);

  if (!open) return null;

  return (
    <div className="fixed z-[80]" style={pos ? { left: pos.left, top: pos.top } : { bottom: 38, right: 10 }}>
      <button
        ref={toastRef}
        onClick={onClose}
        className="text-left w-[320px] rounded-[6px] px-3 py-2 select-none"
        style={{
          background: "linear-gradient(to bottom, #FFFFE6 0%, #FFF4B8 100%)",
          border: "1px solid #C7B25C",
          boxShadow: "2px 2px 8px rgba(0,0,0,0.35)",
        }}
        aria-label="Dismiss welcome message"
      >
        <div className="flex gap-2">
          <img
            src={iconSrc}
            onError={(e) => (e.currentTarget.style.display = "none")}
            alt=""
            className="w-8 h-8 mt-[2px]"
            draggable={false}
          />
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[#1b1b1b]">
              Welcome{typeof name === "string" && name.trim() ? `, ${name}` : ""}.
            </div>
            <div className="text-[11px] text-[#333] mt-0.5 leading-snug">
              Tip: Use the <b>Start</b> menu or double-click icons to explore.
            </div>
            <div className="text-[10px] text-[#555] mt-1">(click to dismiss)</div>
          </div>
        </div>
        {/* little "tail" */}
        <div
          className="absolute -bottom-[10px] w-0 h-0"
          style={{
            left: pos ? (pos.tailX - 10) : undefined,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid #FFF4B8",
            filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.25))",
          }}
        />
      </button>
    </div>
  );
};

export default WelcomeToast;
