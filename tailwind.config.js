/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0E14',     // Tactical Void
          secondary: '#111622',   // Command Surface
          card: '#141B27',        // Telemetry Panel
          elevated: '#182231',    // Elevated Technical Surface
          hover: '#1F2C3F',       // Interactive Panel Hover
        },
        tactical: {
          amber: '#F59E0B',       // Primary Warning Amber
          amberBright: '#FBBF24', // Signal Gold / Highlight
          cyan: '#06B6D4',        // Secondary Radar Cyan
          green: '#22C55E',       // Success / Healthy Green
          red: '#EF4444',         // Critical Alert Red
          blue: '#3B82F6',        // Link telemetry
        },
        brand: {
          mint: '#22C55E',        // Success green
          emerald: '#10B981',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          cobalt: '#3B82F6',
          violet: '#8B5CF6',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#06B6D4',
          neutral: '#64748B',
        },
        text: {
          primary: '#E5E7EB',     // High-readability Light Gray
          secondary: '#94A3B8',   // Technical Slate
          muted: '#64748B',       // Muted Label Gray
        },
        border: {
          subtle: '#1E293B',
          panel: '#243247',
          active: '#06B6D4',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'tactical-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'tactical-amber': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
        'tactical-green': '0 0 20px -3px rgba(34, 197, 94, 0.25)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'data-stream': 'stream 2s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        stream: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        }
      }
    },
  },
  plugins: [],
}
