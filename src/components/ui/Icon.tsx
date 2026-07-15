import type { SVGProps } from "react";

export type IconName =
  | "arrow-right"
  | "bookmark"
  | "book-open"
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "cloud"
  | "download"
  | "headphones"
  | "home"
  | "library"
  | "menu"
  | "pause"
  | "play"
  | "plus"
  | "rewind"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "timer"
  | "upload";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

const ICON_PATHS: Record<IconName, readonly string[]> = {
  "arrow-right": ["M5 12h14", "m13 6 6 6-6 6"],
  bookmark: ["M6 3h12v18l-6-4-6 4V3Z"],
  "book-open": [
    "M3 5.5A3.5 3.5 0 0 1 6.5 2H11v18H6.5A3.5 3.5 0 0 0 3 23.5v-18Z",
    "M21 5.5A3.5 3.5 0 0 0 17.5 2H13v18h4.5a3.5 3.5 0 0 1 3.5 3.5v-18Z",
  ],
  check: ["m5 12 4 4L19 6"],
  "chevron-left": ["m15 18-6-6 6-6"],
  "chevron-right": ["m9 18 6-6-6-6"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 6v6l4 2"],
  cloud: ["M17.5 19H6a4 4 0 0 1-.4-7.98A7 7 0 0 1 19 9a5 5 0 0 1-1.5 10Z"],
  download: ["M12 3v12", "m7 10 5 5 5-5", "M5 21h14"],
  headphones: [
    "M4 14v-2a8 8 0 0 1 16 0v2",
    "M18 19h-2v-6h4v4a2 2 0 0 1-2 2Z",
    "M6 19h2v-6H4v4a2 2 0 0 0 2 2Z",
  ],
  home: ["m3 11 9-8 9 8", "M5 10v11h14V10", "M9 21v-6h6v6"],
  library: [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
    "M4 4v15.5",
    "M8 4h12v13H8a4 4 0 0 0-4 4",
  ],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  pause: ["M9 5v14", "M15 5v14"],
  play: ["m8 5 11 7-11 7V5Z"],
  plus: ["M12 5v14", "M5 12h14"],
  rewind: ["m12 8-5 4 5 4V8Z", "M19 8v8", "M15 12a7 7 0 1 1-7-7"],
  search: ["m21 21-4.3-4.3", "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"],
  settings: [
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20.3h-3v-.08a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.08 15a1.7 1.7 0 0 0-1.56-1H5.4v-3h.12a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06L8.8 5.94l.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V4.7h3v.08a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1h.12v3h-.12a1.7 1.7 0 0 0-1.56 1Z",
  ],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z", "m9 12 2 2 4-4"],
  sparkles: [
    "m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z",
    "m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z",
    "m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z",
  ],
  timer: ["M10 2h4", "M12 14v-4", "M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"],
  upload: ["M12 21V9", "m7 14 5-5 5 5", "M5 3h14"],
};

export default function Icon({ name, ...svgProps }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...svgProps}
    >
      {ICON_PATHS[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
