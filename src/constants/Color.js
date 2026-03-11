export const Colors = {
  // Primary Brand Color - Sage/Mint
  primary: {
    sage: '#88D8C0',        // Base Sage/Mint (136,216,192)
    sage50: '#E6F7F0',      // Lightest Sage
    sage100: '#D1F0E5',     // Very Light Sage
    sage200: '#B8E8D8',     // Light Sage
    sage300: '#A0E0CC',     // Medium Light Sage
    sage400: '#88D8C0',     // Base Sage
    sage500: '#70C0A8',     // Slightly Darker Sage
    sage600: '#58A890',     // Darker Sage
    sage700: '#409078',     // Even Darker Sage
    sage800: '#287860',     // Very Dark Sage
    sage900: '#106048',     // Darkest Sage
  },

  // Gray Scale (based on your gray: 187,187,187)
  gray: {
    base: '#BBBBBB',        // Base Gray (187,187,187)
    50: '#F8F8F8',          // Lightest Gray
    100: '#F0F0F0',         // Very Light Gray
    200: '#E8E8E8',         // Light Gray
    300: '#DDDDDD',         // Medium Light Gray
    400: '#BBBBBB',         // Base Gray
    500: '#999999',         // Medium Gray
    600: '#777777',         // Dark Gray
    700: '#555555',         // Darker Gray
    800: '#333333',         // Very Dark Gray
    900: '#111111',         // Darkest Gray
  },

  // Semantic Colors
  brand: {
    primary: '#88D8C0',      // Main brand color - Sage
    secondary: '#BBBBBB',    // Secondary brand color - Gray
    accent: '#A0E0CC',       // Accent color - Light Sage
    highlight: '#E6F7F0',    // Highlight color - Very Light Sage
  },

  // UI Colors
  ui: {
    primary: '#88D8C0',      // Primary UI elements - Sage
    secondary: '#BBBBBB',    // Secondary UI elements - Gray
    success: '#58A890',      // Success - Darker Sage
    warning: '#F0B27A',      // Warning - Soft Orange
    error: '#E86F6F',        // Error - Soft Red
    info: '#70C0A8',         // Info - Medium Sage
    disabled: '#E8E8E8',     // Disabled state - Light Gray
    border: '#DDDDDD',       // Border color - Medium Light Gray
    card: '#FFFFFF',         // Card background - White
    background: '#F8F8F8',   // App background - Light Gray
  },

  // Text Colors
  text: {
    primary: '#333333',      // Primary text - Dark Gray
    secondary: '#666666',    // Secondary text - Gray
    tertiary: '#999999',     // Tertiary text - Medium Gray
    disabled: '#BBBBBB',     // Disabled text - Base Gray
    inverse: '#FFFFFF',      // Text on dark backgrounds - White
    link: '#58A890',         // Link text - Darker Sage
    linkHover: '#409078',    // Link hover - Even Darker Sage
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',      // Primary background - White
    secondary: '#F8F8F8',    // Secondary background - Light Gray
    tertiary: '#F0F0F0',     // Tertiary background - Very Light Gray
    inverse: '#333333',      // Inverse background - Dark Gray
    overlay: 'rgba(51,51,51,0.5)', // Overlay for modals - Dark Gray with opacity
  },

  // Status Colors
  status: {
    active: '#88D8C0',       // Active state - Sage
    inactive: '#DDDDDD',     // Inactive state - Medium Light Gray
    online: '#58A890',       // Online status - Darker Sage
    offline: '#999999',      // Offline status - Medium Gray
    busy: '#E86F6F',         // Busy status - Soft Red
    away: '#F0B27A',         // Away status - Soft Orange
  },

  // Gradient Combinations (for linear gradient)
  gradients: {
    primary: ['#88D8C0', '#58A890'],
    secondary: ['#BBBBBB', '#999999'],
    accent: ['#A0E0CC', '#70C0A8'],
    sunset: ['#F0B27A', '#E86F6F'],
    ocean: ['#88D8C0', '#70C0A8'],
  },

  // Opacity Variants
  opacity: {
    sage10: 'rgba(136, 216, 192, 0.1)',
    sage20: 'rgba(136, 216, 192, 0.2)',
    sage30: 'rgba(136, 216, 192, 0.3)',
    sage40: 'rgba(136, 216, 192, 0.4)',
    sage50: 'rgba(136, 216, 192, 0.5)',
    sage60: 'rgba(136, 216, 192, 0.6)',
    sage70: 'rgba(136, 216, 192, 0.7)',
    sage80: 'rgba(136, 216, 192, 0.8)',
    sage90: 'rgba(136, 216, 192, 0.9)',
    sage100: 'rgba(136, 216, 192, 1)',
    
    gray10: 'rgba(187, 187, 187, 0.1)',
    gray20: 'rgba(187, 187, 187, 0.2)',
    gray30: 'rgba(187, 187, 187, 0.3)',
    gray40: 'rgba(187, 187, 187, 0.4)',
    gray50: 'rgba(187, 187, 187, 0.5)',
    gray60: 'rgba(187, 187, 187, 0.6)',
    gray70: 'rgba(187, 187, 187, 0.7)',
    gray80: 'rgba(187, 187, 187, 0.8)',
    gray90: 'rgba(187, 187, 187, 0.9)',
    gray100: 'rgba(187, 187, 187, 1)',
  },

  // Chart Colors
  charts: [
    '#88D8C0', // Sage
    '#58A890', // Dark Sage
    '#BBBBBB', // Gray
    '#70C0A8', // Medium Sage
    '#F0B27A', // Soft Orange
    '#E86F6F', // Soft Red
    '#A0E0CC', // Light Sage
    '#999999', // Medium Gray
  ],

  // Dark Mode Variants (optional)
  dark: {
    primary: '#70C0A8',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    border: '#404040',
  }
};

// Simplified version for quick access
export const BrandColors = {
  sage: '#88D8C0',
  sageLight: '#A0E0CC',
  sageDark: '#58A890',
  sageDarker: '#409078',
  gray: '#BBBBBB',
  grayDark: '#666666',
  grayDarker: '#333333',
};

// Flat version for easier use in styles
export const FlatColors = {
  // Primary
  sage: '#88D8C0',
  sageLight: '#A0E0CC',
  sageLighter: '#B8E8D8',
  sageLightest: '#E6F7F0',
  sageDark: '#58A890',
  sageDarker: '#409078',
  sageDarkest: '#287860',
  
  // Gray
  gray: '#BBBBBB',
  grayLight: '#DDDDDD',
  grayLighter: '#E8E8E8',
  grayLightest: '#F8F8F8',
  grayDark: '#777777',
  grayDarker: '#555555',
  grayDarkest: '#333333',
  
  // UI
  success: '#58A890',
  warning: '#F0B27A',
  error: '#E86F6F',
  info: '#70C0A8',
  
  // Text
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#BBBBBB',
  textInverse: '#FFFFFF',
  
  // Background
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F8F8F8',
  bgTertiary: '#F0F0F0',
  bgDark: '#333333',
};

// Usage examples remain the same