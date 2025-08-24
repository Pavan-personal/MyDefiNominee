import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'funnel-display': ['var(--font-funnel-display)', 'system-ui', 'sans-serif'],
        'funnel-sans': ['var(--font-funnel-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1e40af',         // e.g., Tailwind blue-800
        secondary: '#9333ea',       // e.g., Tailwind purple-600
        accent: '#f59e0b',          // e.g., Tailwind amber-500
        muted: '#64748b',           // grayish-blue
        'brand-dark': '#0f172a',    // dark background
        'brand-light': '#f8fafc',   // light background
      },
      screens: {
        'sm': '640px',    // Default Tailwind 'sm'
        'md': '768px',    // Default Tailwind 'md'
        'lg': '1024px',   // Default Tailwind 'lg'
      },
      backgroundImage: {
        'white-pattern': "url('/assets/background/white.svg')",
        'blue-pattern': "url('/assets/background/blue.jpg')",
      },
    },
  },
  plugins: [],
};

export default config;