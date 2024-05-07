import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['node_modules'],
  },
  eslintConfigPrettier,
]
