module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['simple-import-sort', 'jest'],
  rules: {
    'simple-import-sort/imports': 'error',
    'react/react-in-jsx-scope': 'off',
    curly: 'off',
  },
};
