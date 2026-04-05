/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#050B14",
          surface: "rgba(11, 19, 36, 0.7)",
          border: "rgba(56, 189, 248, 0.2)",
        },
        ai: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          glow: "rgba(56, 189, 248, 0.4)",
        }
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)'
          },
          '50%': {
            opacity: '.7',
            boxShadow: '0 0 5px rgba(56, 189, 248, 0.2)'
          },
        }
      }
    },
  },
  plugins: [],
}