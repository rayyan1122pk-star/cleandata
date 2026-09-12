import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        card: "0 10px 30px -4px rgba(15, 23, 42, 0.08)",
        glow: "0 0 25px -3px rgba(79, 70, 229, 0.25)",
        emeraldGlow: "0 0 25px -3px rgba(16, 185, 129, 0.25)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-gentle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
