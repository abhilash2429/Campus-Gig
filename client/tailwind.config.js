/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4e95ff',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          purple: '#7c3aed',
          pink:   '#db2777',
          teal:   '#0d9488',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06)',
        'card-hover': '0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)',
        'btn-glow': '0 0 20px rgba(78,149,255,0.45)',
        'purple-glow': '0 0 20px rgba(124,58,237,0.4)',
        'inner-focus': 'inset 0 0 0 2px rgba(78,149,255,0.6)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%)',
        'btn-primary': 'linear-gradient(135deg, #4e95ff 0%, #2563eb 100%)',
        'btn-purple': 'linear-gradient(135deg, #7c3aed 0%, #4e95ff 100%)',
        'cta-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e1b4b 100%)',
        'auth-panel': 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%)',
        'card-glow': 'radial-gradient(circle at top left, rgba(78,149,255,0.06), transparent 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
