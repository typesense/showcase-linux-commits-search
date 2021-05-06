module.exports = {
  "extends": "eslint:recommended",
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  parser: 'babel-eslint',
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
      "modules": true
    },
    "ecmaVersion": 2020,
    "sourceType": "module",
    "useJSXTextNode": true
  },
  "root": true,
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "commonjs": true
  },
  "globals": {
    "$": true
  }
};
