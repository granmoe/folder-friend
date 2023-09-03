import path from 'path'
import { buildFormattedFileTree } from '.'

test('printFileTree', async () => {
  const prettyFileTree = await buildFormattedFileTree(
    path.resolve(__dirname, '../__test-projects/basic-project/src'),
  )

  const lines = prettyFileTree.split('\n')

  // prettier-ignore
  expect(lines).toEqual([
    '├── index.ts',
    '└── utilities',
    '    └── helper.ts',
  ])
})
