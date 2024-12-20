export default {
	displayName: 'api',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	globalSetup: '<rootDir>/global-setup.ts',
	globalTeardown: '<rootDir>/global-teardown.ts',
	maxWorkers: 4,
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/apps/api',
	clearMocks: true,
};
