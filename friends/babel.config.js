module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv', { allowUndefined: false, allowList: ['API_URL'], safe: true }],
  ],
};
