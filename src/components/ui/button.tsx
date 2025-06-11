import { ButtonHTMLAttributes } from "react";

export function Button({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00ff88] to-[#00cc70] text-black font-semibold px-5 py-3 shadow-[0_0_10px_#00ff88] hover:shadow-[0_0_15px_#00ff88] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
