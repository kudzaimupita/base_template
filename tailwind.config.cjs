/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
const safeListFile = 'safelist.txt';
const colors = require('tailwindcss/colors');
const SAFELIST_COLORS = 'colors';

module.exports = {
  // mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  darkMode: ['class'],
  safelist: [
    // ========================================
    // LAYOUT & SIZING
    // ========================================

    // Specific sizes
    'w-[1600px]',
    'h-[436px]',

    // Width & Height with CSS variables
    'w-[var(--width)]',
    'h-[var(--height)]',

    // Z-index
    'z-[var(--z-index)]',

    // ========================================
    // SPACING
    // ========================================

    // Margin
    'm-[var(--margin)]',
    'mx-[var(--margin-x)]',
    'my-[var(--margin-y)]',
    'ml-[var(--margin-left)]',
    'mr-[var(--margin-right)]',
    'mt-[var(--margin-top)]',
    'mb-[var(--margin-bottom)]',

    // Padding
    'p-[var(--padding)]',
    'px-[var(--padding-x)]',
    'py-[var(--padding-y)]',
    'pt-[var(--padding-top)]',
    'pb-[var(--padding-bottom)]',
    'pl-[var(--padding-left)]',
    'pr-[var(--padding-right)]',

    // ========================================
    // POSITIONING
    // ========================================

    'left-[var(--left)]',
    'right-[var(--right)]',
    'top-[var(--top)]',
    'bottom-[var(--bottom)]',

    // ========================================
    // TRANSFORMS
    // ========================================

    'rotate-[var(--rotate)]',
    'scale-[var(--scale)]',
    'translate-x-[var(--translate-x)]',
    'translate-y-[var(--translate-y)]',

    // ========================================
    // BORDERS - Width
    // ========================================

    // Unified border width
    'border-[length:var(--border-width)]', // ✅ FIXED: Added 'length:'

    // Individual sides with property syntax
    '[border-top-width:var(--border-top-width)]', // ✅ Correct
    '[border-bottom-width:var(--border-bottom-width)]', // ✅ Correct
    '[border-left-width:var(--border-left-width)]', // ✅ Correct
    '[border-right-width:var(--border-right-width)]', // ✅ Correct

    // Axis borders with Tailwind classes
    'border-x-[length:var(--border-x-width)]', // ✅ FIXED: Added 'length:'
    'border-y-[length:var(--border-y-width)]', // ✅ FIXED: Added 'length:'

    // Individual sides with Tailwind classes
    'border-t-[length:var(--border-top-width)]', // ✅ FIXED: Added 'length:'
    'border-b-[length:var(--border-bottom-width)]', // ✅ FIXED: Added 'length:'
    'border-l-[length:var(--border-left-width)]', // ✅ FIXED: Added 'length:'
    'border-r-[length:var(--border-right-width)]', // ✅ FIXED: Added 'length:'

    // ========================================
    // BORDERS - Color
    // ========================================

    // Unified border color
    'border-[color:var(--border-color)]', // ✅ FIXED: Added 'color:'
    '[border-color:var(--border-color)]', // ✅ Correct

    // Individual side colors with property syntax
    '[border-top-color:var(--border-top-color)]', // ✅ Correct
    '[border-bottom-color:var(--border-bottom-color)]', // ✅ Correct
    '[border-left-color:var(--border-left-color)]', // ✅ Correct
    '[border-right-color:var(--border-right-color)]', // ✅ Correct

    // Individual side colors with Tailwind classes
    'border-t-[color:var(--border-top-color)]', // ✅ FIXED: Added 'color:'
    'border-b-[color:var(--border-bottom-color)]', // ✅ FIXED: Added 'color:'
    'border-l-[color:var(--border-left-color)]', // ✅ FIXED: Added 'color:'
    'border-r-[color:var(--border-right-color)]', // ✅ FIXED: Added 'color:'

    // ========================================
    // BORDERS - Style
    // ========================================

    // These are all correct - standard Tailwind classes
    'border-solid', // ✅ Correct
    'border-dashed', // ✅ Correct
    'border-dotted', // ✅ Correct
    'border-double', // ✅ Correct
    'border-none', // ✅ Correct

    // Individual side border styles
    'border-t-solid', // ✅ Correct
    'border-b-solid', // ✅ Correct
    // ... all the rest are correct

    // ========================================
    // OUTLINE
    // ========================================

    // Outline width with CSS variables
    'outline-[length:var(--outline-width)]', // ✅ FIXED: Added 'length:'
    '[outline-width:var(--outline-width)]', // ✅ Correct

    // Outline color with CSS variables
    'outline-[color:var(--outline-color)]', // ✅ FIXED: Added 'color:'
    '[outline-color:var(--outline-color)]', // ✅ Correct

    // Outline offset
    'outline-offset-[length:var(--outline-offset)]', // ✅ FIXED: Added 'length:'

    // Outline styles
    'outline', // ✅ Correct
    'outline-none', // ✅ Correct
    'outline-dashed', // ✅ Correct
    'outline-dotted', // ✅ Correct
    'outline-double', // ✅ Correct

    // ========================================
    // VISUAL EFFECTS
    // ========================================

    // Opacity
    'opacity-[var(--opacity)]',

    // Filters
    'filter-[var(--filter)]',
    'blur-[var(--blur)]',
    'backdrop-blur-[var(--backdrop-blur)]',
    'brightness-[var(--brightness)]',
    'contrast-[var(--contrast)]',
    'grayscale-[var(--grayscale)]',
    'hue-rotate-[var(--hue-rotate)]',
    'invert-[var(--invert)]',
    'saturate-[var(--saturate)]',
    'sepia-[var(--sepia)]',

    // Shadows
    'drop-shadow-[var(--drop-shadow)]',
    '[box-shadow:var(--shadow)]',
    '[box-shadow:var(--inset-shadow)]',
    '[box-shadow:var(--combined-shadow)]',

    // Mix blend
    'mix-blend-difference',
    'delay-[var(--mix-blend)]',

    // ========================================
    // ANIMATION & TRANSITIONS
    // ========================================

    'duration-[var(--transition-duration)]',

    // ========================================
    // BORDER RADIUS
    // ========================================

    'rounded-[var(--rounded)]',

    // ========================================
    // BACKGROUNDS & COLORS
    // ========================================

    // Background color
    'bg-[var(--bg-color)]',

    // Background image
    'bg-[image:var(--bg-image)]',

    // Gradient directions
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',

    // Specific gradient colors
    'from-[#0A0A0B]',
    'to-[#1A1A2E]',
    'from-[#00D4FF]',
    'via-[#7B2FFF]',
    'to-[#00FF88]',
    'bg-gradient-to-br from-[#1A1A2E] to-[#121218]',

    // Background clip and text utilities
    'bg-clip-text',
    'text-transparent',

    // ========================================
    // DYNAMIC PATTERNS
    // ========================================

    // Standard gradient colors
    {
      pattern:
        /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // Pattern for arbitrary hex colors in gradients
    {
      pattern: /^(from|via|to)-\[#[0-9A-Fa-f]{6}\]$/,
    },
    // Pattern for arbitrary hex colors with alpha
    {
      pattern: /^(from|via|to)-\[#[0-9A-Fa-f]{8}\]$/,
    },
    // Pattern for arbitrary RGB/RGBA colors
    {
      pattern: /^(from|via|to)-\[rgb\(.+\)\]$/,
    },
    {
      pattern: /^(from|via|to)-\[rgba\(.+\)\]$/,
    },
  ],
  theme: {
    fontFamily: {
      sans: [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'],
    },
    screens: {
      xs: '576px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Add CSS variable support to theme values
      zIndex: {
        var: 'var(--z-index)',
      },
      width: {
        var: 'var(--width)',
      },
      height: {
        var: 'var(--height)',
      },
      translate: {
        'var-x': 'var(--translate-x)',
        'var-y': 'var(--translate-y)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('./twSafelistGenerator')({
      path: safeListFile,
      patterns: [
        `text-{${SAFELIST_COLORS}}`,
        `bg-{${SAFELIST_COLORS}}`,
        `dark:bg-{${SAFELIST_COLORS}}`,
        `dark:hover:bg-{${SAFELIST_COLORS}}`,
        `dark:active:bg-{${SAFELIST_COLORS}}`,
        `hover:text-{${SAFELIST_COLORS}}`,
        `hover:bg-{${SAFELIST_COLORS}}`,
        `active:bg-{${SAFELIST_COLORS}}`,
        `ring-{${SAFELIST_COLORS}}`,
        `hover:ring-{${SAFELIST_COLORS}}`,
        `focus:ring-{${SAFELIST_COLORS}}`,
        `focus-within:ring-{${SAFELIST_COLORS}}`,
        `border-{${SAFELIST_COLORS}}`,
        `focus:border-{${SAFELIST_COLORS}}`,
        `focus-within:border-{${SAFELIST_COLORS}}`,
        `dark:text-{${SAFELIST_COLORS}}`,
        `dark:hover:text-{${SAFELIST_COLORS}}`,
        `h-{height}`,
        `w-{width}`,
        `from-{${SAFELIST_COLORS}}`,
        `via-{${SAFELIST_COLORS}}`,
        `to-{${SAFELIST_COLORS}}`,
        `bg-gradient-to-r`,
        `bg-gradient-to-l`,
        `bg-gradient-to-t`,
        `bg-gradient-to-b`,
        `bg-gradient-to-tr`,
        `bg-gradient-to-tl`,
        `bg-gradient-to-br`,
        `bg-gradient-to-bl`,
        'border-[#00FF88]/30',
      ],
    }),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    // Custom plugin to handle CSS variables and arbitrary values
    function ({ addUtilities, addComponents, theme, variants }) {
      // Add utilities for CSS variables that don't work well with arbitrary values
      addUtilities({
        '.z-var': {
          'z-index': 'var(--z-index)',
        },
        '.w-var': {
          width: 'var(--width)',
        },
        '.h-var': {
          height: 'var(--height)',
        },
        '.rotate-var': {
          '--tw-rotate': 'var(--rotate)',
          transform:
            'translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))',
        },
        '.transform-var': {
          '--tw-translate-x': 'var(--translate-x)',
          '--tw-translate-y': 'var(--translate-y)',
          '--tw-rotate': 'var(--rotate)',
          transform:
            'translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))',
        },
      });

      // Alternative: Add component class for complete dynamic styling
      addComponents({
        '.dynamic-element': {
          'z-index': 'var(--z-index)',
          width: 'var(--width)',
          height: 'var(--height)',
          '--tw-translate-x': 'var(--translate-x)',
          '--tw-translate-y': 'var(--translate-y)',
          '--tw-rotate': 'var(--rotate)',
          transform:
            'translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))',
        },
      });
    },
  ],
};
