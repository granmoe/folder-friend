import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__test-projects/',
  ],
  // prettier-ignore
  testRegex: process.env.E2E ? ['.*e2e\.test\.tsx?'] : ['.*(?<!e2e)\.test.tsx?'],
}

export default jestConfig
