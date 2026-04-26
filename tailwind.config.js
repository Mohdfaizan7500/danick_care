/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],

  content: ["./App.{js,jsx,ts,tsx}","./src2/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color - Sage/Mint
        primary: {
          DEFAULT: '#88D8C0',
          sage: 'bg-teal500',
          sage50: '#E6F7F0',
          sage100: '#D1F0E5',
          sage200: '#B8E8D8',
          sage300: '#A0E0CC',
          sage400: '#88D8C0',
          sage500: '#70C0A8',
          sage600: '#58A890',
          sage700: '#409078',
          sage800: '#287860',
          sage900: '#106048',
        },
        
        // Gray Scale
        gray: {
          DEFAULT: '#BBBBBB',
          50: '#F8F8F8',
          100: '#F0F0F0',
          200: '#E8E8E8',
          300: '#DDDDDD',
          400: '#BBBBBB',
          500: '#999999',
          600: '#777777',
          700: '#555555',
          800: '#333333',
          900: '#111111',
        },

        // Brand Colors
        brand: {
          primary: '#88D8C0',
          secondary: '#BBBBBB',
          accent: '#A0E0CC',
          highlight: '#E6F7F0',
        },

        // UI Colors
        ui: {
          primary: '#88D8C0',
          secondary: '#BBBBBB',
          success: '#58A890',
          warning: '#F0B27A',
          error: '#E86F6F',
          info: '#70C0A8',
          disabled: '#E8E8E8',
          border: '#DDDDDD',
          card: '#FFFFFF',
          background: '#F8F8F8',
        },

        // Text Colors
        text: {
          primary: '#333333',
          secondary: '#666666',
          tertiary: '#999999',
          disabled: '#BBBBBB',
          inverse: '#FFFFFF',
          link: '#58A890',
          linkHover: '#409078',
        },

        // Background Colors
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F8F8',
          tertiary: '#F0F0F0',
          inverse: '#333333',
        },

        // Status Colors
        status: {
          active: '#88D8C0',
          inactive: '#DDDDDD',
          online: '#58A890',
          offline: '#999999',
          busy: '#E86F6F',
          away: '#F0B27A',
        },

        // Flat Colors (for easy access)
        flat: {
          sage: '#88D8C0',
          sageLight: '#A0E0CC',
          sageLighter: '#B8E8D8',
          sageLightest: '#E6F7F0',
          sageDark: '#58A890',
          sageDarker: '#409078',
          sageDarkest: '#287860',
          gray: '#BBBBBB',
          grayLight: '#DDDDDD',
          grayLighter: '#E8E8E8',
          grayLightest: '#F8F8F8',
          grayDark: '#777777',
          grayDarker: '#555555',
          grayDarkest: '#333333',
          success: '#58A890',
          warning: '#F0B27A',
          error: '#E86F6F',
          info: '#70C0A8',
          textPrimary: '#333333',
          textSecondary: '#666666',
          textTertiary: '#999999',
          textDisabled: '#BBBBBB',
          textInverse: '#FFFFFF',
          bgPrimary: '#FFFFFF',
          bgSecondary: '#F8F8F8',
          bgTertiary: '#F0F0F0',
          bgDark: '#333333',
        },
      },
    },
  },
  plugins: [],
}