import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  safelist: [
    // Light mode backgrounds
    "bg-green-100",
    "bg-red-100",
    "bg-yellow-100",
    "bg-orange-100",
    "bg-blue-100",
    "bg-purple-100",
    "bg-indigo-100",
    "bg-pink-100",
    "bg-gray-100",
    "bg-gray-50",
    "bg-gray-700",
    "bg-gray-800",
    "bg-green-50",
    "bg-red-50",
    "bg-yellow-50",
    "bg-orange-50",
    "bg-blue-50",
    "bg-purple-50",

    // Light mode text
    "text-green-800",
    "text-red-800",
    "text-yellow-800",
    "text-orange-800",
    "text-blue-800",
    "text-purple-800",
    "text-indigo-800",
    "text-pink-800",
    "text-gray-800",
    "text-gray-600",

    // Dark mode backgrounds
    "dark:bg-green-900",
    "dark:bg-red-900",
    "dark:bg-yellow-900",
    "dark:bg-orange-900",
    "dark:bg-blue-900",
    "dark:bg-purple-900",
    "dark:bg-indigo-900",
    "dark:bg-pink-900",
    "dark:bg-gray-800",
    "dark:bg-gray-700",

    // Dark mode background overlays
    "dark:bg-green-950/30",
    "dark:bg-red-950/30",
    "dark:bg-yellow-950/30",
    "dark:bg-orange-950/30",
    "dark:bg-blue-950/30",
    "dark:bg-purple-950/30",

    // Dark mode text
    "dark:text-green-300",
    "dark:text-red-300",
    "dark:text-yellow-300",
    "dark:text-orange-300",
    "dark:text-blue-300",
    "dark:text-purple-300",
    "dark:text-indigo-300",
    "dark:text-pink-300",
    "dark:text-gray-300",
  ],
  plugins: [require("tailwindcss-animate")],
};
export default config;
