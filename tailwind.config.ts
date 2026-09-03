import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Two quick beats then a rest, like a real heartbeat ("tun-tun ... tun-tun ...")
        "heartbeat-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.06)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.04)" },
          "56%": { transform: "scale(1)" },
        },
        "heartbeat-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 var(--glow-color, rgba(16,185,129,0.4))" },
          "14%": { boxShadow: "0 0 0 10px rgba(16,185,129,0)" },
          "42%": { boxShadow: "0 0 0 6px rgba(16,185,129,0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "heartbeat-scale": "heartbeat-scale 1.8s ease-in-out infinite",
        "heartbeat-glow": "heartbeat-glow 1.8s ease-in-out infinite",
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
