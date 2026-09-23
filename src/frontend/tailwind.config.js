// tailwind.config.js
// Configuração do Tailwind CSS para o projeto Argos

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Cores customizadas do projeto Argos
      colors: {
        argos: {
          primary: '#7c3aed',
          secondary: '#a78bfa',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
        },
      },
      // Animações customizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
