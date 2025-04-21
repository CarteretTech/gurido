/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Brand colors
        'dark-slate': '#18191a',
        'vibrant-pink': '#ff3fbf',
        'mango-orange': '#ffb347',
        'mint-green': '#7fff9f',
        'dark-purple': '#141115',
        
        primary: {
          DEFAULT: '#ff3fbf', // Vibrant pink from brand palette
          dark: '#e01e9e',    // Darker pink for hover states
          light: '#ff5ec9',   // Lighter pink for dark mode
        },
        secondary: {
          DEFAULT: '#7fff9f', // Mint green from brand palette
          dark: '#60d080',    // Darker mint green
          light: '#8affaa',   // Lighter mint green
        },
        accent: {
          DEFAULT: '#ffb347', // Mango orange from brand palette
          dark: '#e09a32',    // Darker orange
          light: '#ffc067',   // Lighter orange for dark mode
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.dark'),
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.gray.900'),
              fontWeight: theme('fontWeight.bold'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.vibrant-pink'),
              '&:hover': {
                color: theme('colors.primary.light'),
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.white'),
            },
            strong: {
              color: theme('colors.white'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  // Add Tailwind variant for dark mode
  variants: {
    extend: {
      typography: ['dark'],
    },
  },
}