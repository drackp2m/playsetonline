// const swcConfig = JSON.parse(readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

export default {
	displayName: 'api',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	globalSetup: '<rootDir>/global-setup.ts',
	globalTeardown: '<rootDir>/global-teardown.ts',
	maxWorkers: 4,
	transform: {
		// '^.+\\.(t|j)s$': ['@swc/jest', { ...swcConfig }],
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/apps/api',
	clearMocks: true,
};
