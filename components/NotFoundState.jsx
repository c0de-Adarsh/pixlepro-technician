import React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function NotFoundState({
  title = "Job Not Found",
  message = "This job was probably deleted, restricted or never existed.",
  buttonText = "Back to Jobs",
  backUrl = "/jobs",
  breadcrumbs = [],
}) {
  const router = useRouter();

  return (
    <div className="min-h-[75vh] flex flex-col justify-start items-center p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs if provided */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="w-full text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2 mb-8">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>#</span>}
              {b.url ? (
                <span
                  onClick={() => router.push(b.url)}
                  className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                >
                  {b.label}
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Center Illustrated Not Found Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center max-w-md my-auto pt-8 sm:pt-16 space-y-6"
      >
        {/* Workiz Style Folder & Magnifying Glass SVG Illustration */}
        <div className="relative w-40 h-40 flex items-center justify-center select-none">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-blue-100/60 dark:bg-blue-950/40 rounded-full blur-xl -z-10" />

          <svg
            viewBox="0 0 160 160"
            className="w-36 h-36 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Folder Tab & Body */}
            <path
              d="M38 48C38 43.5817 41.5817 40 46 40H66.5C68.8869 40 71.1761 40.9482 72.864 42.636L78.364 48.136C80.0518 49.8239 82.3411 50.772 84.728 50.772H114C118.418 50.772 122 54.3537 122 58.772V104C122 108.418 118.418 112 114 112H46C41.5817 112 38 108.418 38 104V48Z"
              fill="#E2E8F0"
              className="dark:fill-slate-700"
              stroke="#334155"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Sheet inside folder */}
            <rect
              x="48"
              y="32"
              width="50"
              height="36"
              rx="4"
              fill="#FFFFFF"
              stroke="#334155"
              strokeWidth="3"
            />
            <line x1="56" y1="42" x2="80" y2="42" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="48" x2="72" y2="48" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

            {/* Folder Front Flap */}
            <path
              d="M36 62C36 58.6863 38.6863 56 42 56H118C121.314 56 124 58.6863 124 62L120 108C120 112.418 116.418 116 112 116H44C39.5817 116 36 112.418 36 108L36 62Z"
              fill="#F8FAFC"
              className="dark:fill-slate-800"
              stroke="#334155"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Magnifying Glass */}
            <g transform="translate(68, 62)">
              {/* Glass Circle */}
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="#F0F9FF"
                className="dark:fill-slate-900"
                stroke="#334155"
                strokeWidth="3.5"
              />

              {/* Sad / Dizzy Face inside Magnifier */}
              {/* Left 'X' Eye */}
              <path d="M22 22L28 28M28 22L22 28" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              {/* Right 'X' Eye */}
              <path d="M32 22L38 28M38 22L32 28" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              {/* Sad Mouth */}
              <path
                d="M24 38C26 34 34 34 36 38"
                stroke="#475569"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Magnifier Handle */}
              <path
                d="M47 47L62 62"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M50 50L60 60"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Accent Sparks / Lines */}
            <line x1="28" y1="36" x2="22" y2="30" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="128" y1="42" x2="134" y2="38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="120" x2="24" y2="124" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Back Button (Brand Red / Yellow) */}
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="px-7 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
        >
          {buttonText}
        </button>
      </motion.div>
    </div>
  );
}
