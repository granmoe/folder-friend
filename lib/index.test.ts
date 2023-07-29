import { expect, test } from 'vitest'
import path from 'path'
import { findOrphanedDependencies } from './'

test('findOrphanedDependencies()', () => {
  const orphanedDependencies = findOrphanedDependencies({
    tsConfigFilePath: path.resolve(
      __dirname,
      './test-fixtures/basic-project/tsconfig.json',
    ),
  })

  expect(orphanedDependencies.length).toBe(1)
})
