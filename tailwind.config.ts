import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF9F5",
        foreground: "#4A3728",
        primary: { DEFAULT: "#F7A8B8", light: "#FCD5E0", dark: "#E8899A" },
        secondary: { DEFAULT: "#B8D4E3", light: "#D4E8F4", dark: "#8FB8D0" },
        accent: { DEFAULT: "#C5E8D0", light: "#DFF4E6", dark: "#95D4A8" },
        warning: { DEFAULT: "#F5D5A0", light: "#FAE8C8", dark: "#E8B860" },
        card: "#FFFFFF",
        muted: { DEFAULT: "#F5EDE8", foreground: "#9C8577" },
        border: "#F0E4DC",
      },
      fontFamily: {
        heading: ["'Nunito'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(74, 55, 40, 0.06)",
        card: "0 2px 12px rgba(74, 55, 40, 0.08)",
      },
      animation: {
        "bounce-slow": "bounce 3s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
