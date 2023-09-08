module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv', { allowList: ['API_URL', 'ASSET_URL'], safe: true }],
  ],
};
