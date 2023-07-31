import { expect, test } from 'vitest'
import path from 'path'
import {
  buildDependencyGraph,
  findStrayInternalDependencies,
  printProject,
} from './'

const basicProjectTsConfigFilePath = path.resolve(
  __dirname,
  './test-fixtures/basic-project/tsconfig.json',
)
// TODO:
// * Check imports are correct in one test
// * Check file tree is correct in one test
// * Check various problem cases: circular files, etc.

test('buildDependencyGraph()', () => {
  const { dependencyGraph, dependentsCount } = buildDependencyGraph({
    tsConfigFilePath: basicProjectTsConfigFilePath,
  })

  console.log(dependencyGraph)
  console.log(dependentsCount)

  // expect(dependencyGraph.size).toBe(4)
  // expect(dependentsCount.size).toBe(4)
})

test.skip('findStrayInternalDependencies()', () => {
  const tsConfigFilePath = path.resolve(
    __dirname,
    './test-fixtures/basic-project/tsconfig.json',
  )

  console.log(printProject({ tsConfigFilePath }))

  const orphanedDependencies = findStrayInternalDependencies({
    tsConfigFilePath,
  })

  console.log(printProject({ tsConfigFilePath }))

  expect(orphanedDependencies.length).toBe(1)
})

const test = {
  'index.ts': {
    imports: ['a/b.ts', 'c.ts', 'd.ts'],
  },
  'b.ts': {
    imports: ['c.ts'],
  },
  'd.ts': {
    imports: ['e.ts', 'f.ts'],
  },
}
