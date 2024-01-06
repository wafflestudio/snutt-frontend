module.exports = {
  root: true,
  extends: ['@react-native', 'snutt'],
  plugins: ['jest'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    curly: 'off',
  },
};
