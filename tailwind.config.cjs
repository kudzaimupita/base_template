/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
const safeListFile = 'safelist.txt';

// colors.indigo
const SAFELIST_COLORS = 'colors';

module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './safelist.txt'],
  darkMode: 'class',
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
      mono: [
        // 'ui-monospace',
        // 'SFMono-Regular',
        // 'Menlo',
        // 'Monaco',
        // 'Consolas',
        // '"Liberation Mono"',
        // '"Courier New"',
        // 'monospace',
      ],
    },
    screens: {
      xs: '576',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.500'),
            maxWidth: '65ch',
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.400'),
          },
        },
      }),
      cursor: {
        comment: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='21' height='20' viewBox='0 0 21 20' fill='none'%3E%3Cpath d='M13.1304 15.8646L11.6496 17.98C11.257 18.5408 10.4265 18.5408 10.034 17.98L8.55316 15.8646H2.43464C2.18689 15.8646 1.9493 15.7661 1.77411 15.591C1.59894 15.4158 1.50052 15.1782 1.50052 14.9304V1.85268C1.50052 1.60493 1.59894 1.36734 1.77411 1.19215C1.9493 1.01697 2.18689 0.918553 2.43464 0.918553H19.2489C19.4966 0.918553 19.7343 1.01697 19.9094 1.19215C20.0846 1.36734 20.183 1.60493 20.183 1.85268V14.9304C20.183 15.1782 20.0846 15.4158 19.9094 15.591C19.7343 15.7661 19.4966 15.8646 19.2489 15.8646H13.1304Z' fill='black'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.60032 3.21005H17.7513V13.7183H12.2035L10.7145 14.8393L9.43232 13.9294H3.60032V3.21005Z' fill='white'/%3E%3C/svg%3E") 4 4, auto`,
        draw: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M0.186157 5.77388V0.417328L5.54268 0.289795L18.6471 13.5855C19.0731 14.0095 19.2633 15.3605 18.8384 15.7855L15.7456 18.9739C15.3232 19.3964 14.2576 19.3938 13.8326 18.9739L0.186157 5.77388Z' fill='white'/%3E%3Cpath d='M11.9752 13.4066L13.3432 12.0386L4.33333 3.02869H2.96526L2.96526 4.39676L11.9752 13.4066ZM13.3432 14.7747L14.7113 16.1427L16.0794 14.7747L14.7113 13.4066L13.3432 14.7747ZM1.03051 5.19817L1.03051 1.09393L5.1348 1.09393L18.1315 14.0906C18.5093 14.4685 18.5093 15.081 18.1315 15.4587L15.3953 18.1949C15.0176 18.5727 14.405 18.5727 14.0273 18.1949L1.03051 5.19817Z' fill='black'/%3E%3C/svg%3E") 4 4, auto !important`,
        path: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M17.5253 12.4975L12.3435 17.4645C12.4279 17.8791 12.6185 18.8553 12.6945 19.2482C12.7705 19.6411 13.6182 19.7306 13.84 19.6092C15.7727 17.7081 19.6517 13.8727 19.7392 13.5811C19.777 13.4551 19.6262 13.213 19.4747 13.0102C19.3247 12.8097 19.092 12.6906 18.8435 12.66L17.5253 12.4975Z' fill='%23D9D9D9'/%3E%3Cpath d='M11.5534 17.2257L5.65982 16.4999L5.03665 13.6842C4.29686 10.3416 2.80943 7.21001 0.686035 4.5246V4.5246L4.49116 0.659576L5.95496 1.68607C8.34587 3.36271 11.0602 4.52226 13.9245 5.09067L16.4664 5.59508L17.0239 11.9005L11.5534 17.2257Z' fill='white'/%3E%3Cpath d='M19.2299 13.7363L13.7179 19.2482C13.5484 19.4178 13.2734 19.4178 13.1038 19.2482C13.0388 19.1832 12.9961 19.0992 12.9819 19.0082L12.7817 17.728L17.6946 12.8151L18.9842 12.9993C19.2217 13.0333 19.3866 13.2532 19.3527 13.4907C19.3394 13.5837 19.2963 13.6698 19.2299 13.7363ZM2.63199 3.31326C5.52535 6.5461 6.39062 10.2568 7.42647 14.2936L10.9155 14.6813L14.6478 10.949L14.2602 7.45985C10.2234 6.42407 6.51265 5.55874 3.27988 2.66536L4.49116 1.45403C7.35708 3.91049 10.5299 4.83166 15.8523 6.05988L16.4664 11.5869L11.5534 16.4999L6.02647 15.8857C4.79826 10.5634 3.87705 7.39046 1.42062 4.5246L2.63199 3.31326ZM7.86879 7.90222C8.54716 7.22389 9.64693 7.22389 10.3252 7.90222C11.0036 8.58057 11.0036 9.68034 10.3252 10.3586C9.64693 11.037 8.54716 11.037 7.86879 10.3586C7.1905 9.68034 7.1905 8.58057 7.86879 7.90222Z' fill='black'/%3E%3C/svg%3E") 4 4, auto !important`,
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      ],
    }),
    require('@tailwindcss/typography'),
  ],
};
