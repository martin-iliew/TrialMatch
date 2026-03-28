import localFont from "next/font/local";

export const mpexSans = localFont({
  src: [
    {
      path: "../../public/fonts/GoogleSansFlex.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--ff-body",
  display: "swap",
  preload: true,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
});

export const mpexSansRounded = localFont({
  src: [
    {
      path: "../../public/fonts/GoogleSansFlex.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--ff-display",
  display: "swap",
  preload: true,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});
