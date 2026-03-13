import { defineConfig, defineGlobalStyles } from '@pandacss/dev'

const globalCss = defineGlobalStyles({
  html: {
    fontSize: 'clamp(1.125em,3vi,1.25em)',
  },
})

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './atoms/**/*.{js,jsx,ts,tsx}',
  ],

  // Files to exclude
  exclude: [],

  globalCss,

  // Useful for theme customization
  theme: {
    extend: {},
  },

  conditions: {
    extend: {
      frozen: '&[data-frozen]',
    },
  },

  strictTokens: true,
  strictPropertyValues: true,
  jsxFramework: 'react',
})
