/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  id?: string;
  variant?: "light" | "dark";
}

export default function BackButton({
  onClick,
  label = "Back",
  className = "",
  id,
  variant = "light"
}: BackButtonProps) {
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer group shrink-0 select-none ${
        isDark
          ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800 shadow-sm"
          : "bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:text-stone-900 border-stone-200 shadow-2xs"
      } ${className}`}
      aria-label={label}
    >
      <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-0.5 ${
        isDark ? "text-slate-400 group-hover:text-white" : "text-stone-500 group-hover:text-stone-900"
      }`} />
      <span>{label}</span>
    </button>
  );
}
