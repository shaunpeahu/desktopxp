import React from "react";

interface LoginScreenProps {
  fullname: string;
  title: string;
  avatar: string; // e.g. "profile.jpg"
  onLogin: () => void;
  onShutdown: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  fullname,
  title,
  avatar,
  onLogin,
  onShutdown,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden font-tahoma">
      {/* Background */}
      <img
        src="images/xp-login-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Login Panel (XP-style: user tile sits slightly right of center) */}
      <div className="absolute inset-0 flex items-center justify-end pr-[clamp(24px,10vw,220px)]">
        <div className="flex items-center gap-10">
          {/* User Tile */}
          <button
            onClick={onLogin}
            className={
              "group flex items-center gap-5 px-6 py-4 rounded-md transition-all " +
              "hover:bg-white/10 hover:outline hover:outline-1 hover:outline-white/20 " +
              "active:bg-white/5"
            }
          >
            {/* Avatar */}
            <div className="w-[96px] h-[96px] rounded-md bg-white border border-[#7a7a7a] shadow-md overflow-hidden">
              <img
                src={`images/${avatar}`}
                alt="User"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Name + title (RIGHT SIDE) */}
            <div className="flex flex-col items-start">
              <span className="text-white text-[18px] font-bold drop-shadow-md">
                {fullname}
              </span>
              <span className="text-white/80 text-[12px] mt-1">
                {title}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[54px] flex items-center justify-between px-6">
        {/* Turn off computer */}
        <button
          onClick={onShutdown}
          className="text-white text-[12px] hover:underline flex items-center gap-2"
        >
          <img
            src="images/power.ico"
            alt=""
            className="w-4 h-4"
            draggable={false}
          />
          Turn off computer
        </button>

        {/* Hint text (optional XP feel) */}
        <span className="text-white/70 text-[11px]">
          After you log on, you can add or change accounts.
        </span>
      </div>
    </div>
  );
};

export default LoginScreen;
