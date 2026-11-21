import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        "vb-heading": ["var(--font-vb-heading)", "'Times New Roman'", "serif"],
        "vb-body": ["var(--font-vb-body)", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"],
        "vb-deva": ["var(--font-vb-deva)", "serif"],
        sans: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Kartika Vanabhojanam palette: deep forest green, restrained brass, dusty rose.
        "vb-brand": {
          50: "#eef4f0", 100: "#d7e5db", 200: "#b3ccbc", 300: "#8aaf98", 400: "#5f8f74",
          500: "#3b7355", 600: "#1f5a3d", 700: "#184831", 800: "#12362a", 900: "#0b241b",
        },
        "vb-brass": {
          50: "#faf5e8", 100: "#f1e6c6", 200: "#e5d2a0", 300: "#d6bb78", 400: "#c9a24a",
          500: "#b4893a", 600: "#966f2c", 700: "#745522", 800: "#523c18", 900: "#33250f",
        },
        "vb-lotus": {
          50: "#f8eeee", 100: "#eed6d6", 200: "#e1b9bb", 300: "#d09ba0", 400: "#bf7e86",
          500: "#a8646f", 600: "#8a4f5a", 700: "#6b3d46", 800: "#4c2b32", 900: "#2f1a1f",
        },
        "vb-page": "#faf8f3",
        "vb-night": "#0a1511",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "vb-soft": "0 1px 2px rgba(16,32,24,0.05), 0 8px 24px -14px rgba(16,32,24,0.16)",
        "vb-lift": "0 2px 4px rgba(16,32,24,0.06), 0 18px 36px -20px rgba(16,32,24,0.28)",
      },
      keyframes: {
        firefly: {
          "0%, 100%": { opacity: "0.1", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-10px)" },
        },
        kcDrift: {
          from: { transform: "scale(1) translate(0, 0)" },
          to: { transform: "scale(1.06) translate(-1.2%, -1%)" },
        },
        kcRays: {
          "0%, 100%": { opacity: "0.35", transform: "translateX(-6%)" },
          "50%": { opacity: "1", transform: "translateX(6%)" },
        },
        heroSheen: {
          from: { backgroundPosition: "100% 0" },
          to: { backgroundPosition: "0% 0" },
        },
        "vb-rise": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "vb-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(-1.5deg)" },
          "50%": { transform: "translateY(-8px) rotate(1.5deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "vb-bob": "vb-bob 5s ease-in-out infinite",
        "vb-rise": "vb-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
