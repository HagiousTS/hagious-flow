/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="sankhya-dark"]', '[data-theme="hagious-purple"]'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Tokens semânticos: usam CSS vars definidas em globals.css
        bg:      'hsl(var(--bg) / <alpha-value>)',
        panel:   'hsl(var(--panel) / <alpha-value>)',
        panel2:  'hsl(var(--panel-2) / <alpha-value>)',
        border:  'hsl(var(--border) / <alpha-value>)',
        text:    'hsl(var(--text) / <alpha-value>)',
        muted:   'hsl(var(--muted) / <alpha-value>)',
        brand:   'hsl(var(--brand) / <alpha-value>)',
        brand2:  'hsl(var(--brand-2) / <alpha-value>)',
        ok:      'hsl(var(--ok) / <alpha-value>)',
        warn:    'hsl(var(--warn) / <alpha-value>)',
        danger:  'hsl(var(--danger) / <alpha-value>)',
        info:    'hsl(var(--info) / <alpha-value>)',
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '6px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ping: {
          '0%':         { transform: 'scale(.9)', opacity: '0.6' },
          '80%, 100%':  { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s infinite',
        ping: 'ping 1.6s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
