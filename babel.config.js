module.exports = {
  presets: [
    "module:@react-native/babel-preset",
    "nativewind/babel"
  ],
  plugins: [
    // 'react-native-reanimated/plugin', // MUST be last
    'react-native-worklets/plugin', // ← not reanimated/plugin
  ],
};