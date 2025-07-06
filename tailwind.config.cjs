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
    // Specific sizes
    'w-[1600px]',
    'h-[436px]',

    // CSS Variable utilities - force include these
    'z-[var(--z-index)]',
    'w-[var(--width)]',
    'h-[var(--height)]',
    'w-[var(--width)]',
    'h-[var(--height)]',
    'm-[var(--margin)]',
    'mx-[var(--margin-x)]',
    'my-[var(--margin-y)]',
    'ml-[var(--margin-y)]',
    'mr-[var(--margin-right)]',
    'mt-[var(--margin-top)]',
    'mb-[var(--margin-bottom)]',
    'left-[var(--left)]',
    'right-[var(--left)]',
    'top-[var(--top)]',
    'bottom-[var(--bottom)]',
    'rotate-[var(--rotate)]',
    'scale-[var(--scale)]',
    'x-[var(--translate-x)]',
    'translate-y-[var(--translate-y)]',
    'opacity-[var(--opacity)]',
    'filter-[var(--filter)]',
    'brightness-[var(-brightness)]',
    'blur-[var(-blur)]',
    'brightness-[var(-brightness)]',
    'contrast-[var(-contrast)]',
    'grayscale-[var(-grayscale)]',
    'hue-rotate-[var(-hue-rotate)]',
    'invert-[var(-invert)]',
    'saturate-[var(-saturate)]',
    'sepia-[var(-sepia)]',
    'drop-shadow-[var(-drop-shadow)]',
    'duration-[var(--transition-duration)]',
    'delay-[var(--mix-blend)]',
    'border-[var(--border-color)]',
    'border-[var(--border-width)]',
    'rounded-[var(--rounded)]',

    'p-[var(--padding)]',
    'pt-[var(--padding-top)]',
    'pb-[var(--padding-bottom)]',
    'pl-[var(--padding-left)]',
    'pr-[var(--padding-right)]',
    'px-[var(--padding-x)]',
    'py-[var(--padding-y)]',

    'rounded-[var(--rounded)]',
    'rounded-t-[var(--rounded-t)]',
    'rounded-b-[var(--rounded-b)]',
    'rounded-l-[var(--rounded-l)]',
    'rounded-r-[var(--rounded-r)]',
    'rounded-tl-[var(--rounded-tl)]',
    'rounded-tr-[var(--rounded-tr)]',
    'rounded-bl-[var(--rounded-bl)]',
    'rounded-br-[var(--rounded-br)]',
    'text-[var(--text-color)]',

    // Custom utility classes
    // 'z-var',
    // 'w-var',
    // 'h-var',
    // 'rotate-var',
    // 'transform-var',

    // Gradient directions
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',

    // Specific gradient colors you're using
    'from-[#0A0A0B]',
    'to-[#1A1A2E]',
    'from-[#00D4FF]',
    'via-[#7B2FFF]',
    'to-[#00FF88]',
' bg-gradient-to-br from-[#1A1A2E] to-[#121218] ',
    // Background clip and text utilities
    'bg-clip-text',
    'text-transparent',

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
        'border-[#00FF88]/30'
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