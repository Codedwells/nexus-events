module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	root: true,
	extends: [
		'next',
		'eslint:recommended',
		'prettier',
		'next/core-web-vitals',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:prettier/recommended',
		'plugin:react-hooks/recommended'
	],

	rules: {
		'prefer-const': 'warn',
		'no-var': 'warn',
		'no-unused-vars': 'warn',
		'object-shorthand': 'warn',
		'quote-props': ['warn', 'as-needed'],
		'@typescript-eslint/array-type': [
			'warn',
			{
				default: 'array'
			}
		],
		'@typescript-eslint/consistent-type-assertions': [
			'warn',
			{
				assertionStyle: 'as',
				objectLiteralTypeAssertions: 'never'
			}
		],
		'react/jsx-fragments': ['warn', 'syntax'],
		'react/jsx-filename-extension': [
			'warn',
			{
				extensions: ['ts', 'tsx']
			}
		],
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'prettier/prettier': 'warn',
		'@typescript-eslint/no-explicit-any': 'off'
	},
	settings: {
		react: {
			version: 'detect'
		}
	},
	ignorePatterns: ['src/components/ui/*']
};
