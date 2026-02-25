/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-responsive font sizes
      // Mobile: larger (readable), Desktop: precise (compact)
      fontSize: {
        // text-tiny-responsive: 12px mobile → 8px desktop
        'tiny-responsive': ['0.75rem', { lineHeight: '1rem' }], // Default mobile

        // text-small-responsive: 12px mobile → 9px desktop
        'small-responsive': ['0.75rem', { lineHeight: '1rem' }],

        // text-normal-responsive: 14px mobile → 10px desktop
        'normal-responsive': ['0.875rem', { lineHeight: '1.25rem' }],

        // text-medium-responsive: 14px mobile → 11px desktop
        'medium-responsive': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      // Mobile-responsive spacing
      spacing: {
        'touch-min': '2.75rem', // 44px - min touch target
      },
      // Mobile-responsive gaps
      gap: {
        'responsive': '0.75rem', // 12px mobile
        'responsive-tight': '0.5rem', // 8px mobile
      },
    },
  },
  plugins: [
    // Custom plugin for responsive text utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Desktop overrides (sm: 640px+)
        '@media (min-width: 640px)': {
          '.text-tiny-responsive': {
            fontSize: '8px',
            lineHeight: '12px',
          },
          '.text-small-responsive': {
            fontSize: '9px',
            lineHeight: '13px',
          },
          '.text-normal-responsive': {
            fontSize: '10px',
            lineHeight: '14px',
          },
          '.text-medium-responsive': {
            fontSize: '11px',
            lineHeight: '15px',
          },
          '.gap-responsive': {
            gap: '0.375rem', // 6px desktop
          },
          '.gap-responsive-tight': {
            gap: '0.25rem', // 4px desktop
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}