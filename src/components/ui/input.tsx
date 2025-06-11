import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-gray-900 border border-[#00ff88] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:shadow-[0_0_10px_#00ff88] text-gray-200 placeholder-gray-500 hover:bg-gray-800 transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
