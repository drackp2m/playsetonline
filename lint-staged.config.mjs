export default {
	'*.{json,yml,yaml,md}': 'npm run prettier',
	'*.{html,js,ts}': 'npm run eslint -- --no-warn-ignored',
	'*.{css,scss}': 'npm run stylelint',
};
