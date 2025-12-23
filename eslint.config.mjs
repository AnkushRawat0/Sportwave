import js from '@eslint/js'

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', '.vercel/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'react-hooks/rules-of-hooks': 'off'
    }
  }
]
