import React, { forwardRef } from "react";

interface DesktopIconProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

/**
 * Desktop icons behave more like Windows:
 * - Single click selects
 * - Double click opens
 */
export const DesktopIcon = forwardRef<HTMLButtonElement, DesktopIconProps>(
  ({ id, icon, label, selected, onSelect, onOpen }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onOpen(id);
        }}
        className={
          "w-24 group flex flex-col items-center gap-1 p-1 rounded transition-colors " +
          (selected
            ? "bg-[#0b61ff]/30 outline outline-1 outline-dotted outline-white/70"
            : "hover:bg-[#0b61ff]/20")
        }
        aria-pressed={selected}
      >
        <div className="w-12 h-12 flex items-center justify-center filter drop-shadow-md">
          {icon}
        </div>
        <span
          className={
            "text-white text-xs font-tahoma text-center px-1 rounded-sm " +
            "drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] line-clamp-2 " +
            (selected ? "bg-[#0b61ff]" : "group-hover:bg-[#0b61ff]")
          }
          style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
        >
          {label}
        </span>
      </button>
    );
  }
);

DesktopIcon.displayName = "DesktopIcon";
