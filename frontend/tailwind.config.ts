import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*. {js,ts,jsx,tsx,mdx}",
  ],
  theme:  {
    extend:  {
      colors:  {
        // Aeon Brand Colors - Matching DevMode Dark Theme
        aeon: {
          bg: {
            primary: "#050505",       // Main background (almost black)
            secondary: "rgba(9, 9, 11, 0.6)",  // Card/section background
            tertiary: "#18181b",      // zinc-900 - Elevated elements
            hover: "rgba(255, 255, 255, 0.02)", // Subtle hover
            input: "rgba(0, 0, 0, 0.2)",        // Input backgrounds
          },
          border: {
            DEFAULT: "rgba(255, 255, 255, 0.05)",  // Very subtle borders
            subtle: "rgba(255, 255, 255, 0.05)",
            hover: "rgba(255, 255, 255, 0.1)",
            focus: "rgba(255, 255, 255, 0.2)",
          },
          text: {
            primary: "#fafafa",       // zinc-50 - Primary text (white)
            secondary: "#a1a1aa",     // zinc-400 - Secondary text
            muted: "#52525b",         // zinc-600 - Muted text
            placeholder: "#3f3f46",   // zinc-700 - Placeholder
          },
          accent: {
            primary: "#ffffff",       // White as primary accent
            secondary: "#e4e4e7",     // zinc-200
            success: "#22c55e",       // Success green
            warning: "#f59e0b",       // Warning amber
            danger: "#ef4444",        // Danger red
            info: "#3b82f6",          // Info blue
            indigo: "#6366f1",        // Indigo for some accents
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "aeon-sm": "0 2px 8px 0 rgba(0, 0, 0, 0.5)",
        "aeon-md": "0 4px 16px 0 rgba(0, 0, 0, 0.6)",
        "aeon-lg": "0 8px 32px 0 rgba(0, 0, 0, 0.7)",
        "aeon-glow": "0 0 20px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%":  { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;