export default {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
};

