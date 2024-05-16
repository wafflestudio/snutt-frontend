module.exports = {
  extends: [
    '@react-native',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
