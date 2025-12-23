import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Typography Scale - 1.25 Ratio (Major Third)
      // Base: 16px, each step multiplies by 1.25
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1' }],         // 72px - Hero headlines
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.7',
      },
      // Complete Gray Scale (50-900)
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        gray: {
          50: '#FAFAFA',   // Backgrounds
          100: '#F5F5F5',  // Hover backgrounds
          200: '#E5E5E5',  // Borders
          300: '#D4D4D4',  // Hover borders
          400: '#A3A3A3',  // Disabled text
          500: '#737373',  // Placeholder
          600: '#525252',  // Secondary text
          700: '#404040',  // Body text
          800: '#262626',  // Headings
          900: '#171717',  // Emphasis
        },
        // Primary - Warm Brown
        primary: {
          DEFAULT: '#C9A76B',
          hover: '#B8955A',
          light: '#F7F3ED',
        },
        // Accent (kept for backward compatibility)
        accent: {
          DEFAULT: '#C9A76B',  // Same as primary
          hover: '#B8955A',
          light: '#F7F3ED',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#9CAF6E',
          hover: '#8A9C5F',
          light: '#F2F5ED',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#FF5722',
          hover: '#E64A19',
          light: '#FFF3F0',
        },
        info: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#DBEAFE',
        },
      },
      // Spacing System (8px Grid)
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px - Micro
        '2': '0.5rem',    // 8px - Tight
        '3': '0.75rem',   // 12px - Compact
        '4': '1rem',      // 16px - Default
        '6': '1.5rem',    // 24px - Comfortable
        '8': '2rem',      // 32px - Generous
        '12': '3rem',     // 48px - Section
        '16': '4rem',     // 64px - Major
        '24': '6rem',     // 96px - Hero
        '32': '8rem',     // 128px - Page
      },
      // Border Radius
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.625rem',   // 10px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
      },
      // Shadow System
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 20px rgba(0, 0, 0, 0.10)',
        'xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
      // Animation System
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'default': 'ease-out',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
