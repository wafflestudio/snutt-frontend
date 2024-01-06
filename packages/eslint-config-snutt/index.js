module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: ["node_modules/", "dist/"],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort"],
  rules: {
    "simple-import-sort/imports": "error",
  },
};
