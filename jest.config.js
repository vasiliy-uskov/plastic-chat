module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"/tests/",
		"/src/model/element", // structures typedefs
		"src/model/Document.ts" // document typedefs
	],
	collectCoverage: true,
	collectCoverageFrom: [
		"./src/**/*.ts"
	]
};