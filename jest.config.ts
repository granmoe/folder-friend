import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__test-projects/',
  ],
  // prettier-ignore
  testRegex: ['.*\.test\.tsx?'],
}

export default jestConfig
