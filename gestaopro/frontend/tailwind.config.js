export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00422f',
        'primary-container': '#0f5b44',
        'primary-fixed': '#abf1d2',
        surface: '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3f4944',
        secondary: '#565e74',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
