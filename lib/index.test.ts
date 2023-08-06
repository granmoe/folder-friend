import path from 'path'
import { expect, test, vi } from 'vitest'
import { Project } from 'ts-morph'
import { buildDependencyGraph, updateFolderStructure } from './'

const basicProject = new Project({
  tsConfigFilePath: path.resolve(
    __dirname,
    './__test-fixtures/basic-project/tsconfig.json',
  ),
})

// vi.mock('./open-ai', () => {
//   return {
//     fetchChatCompletion: async () => [
//       {
//         type: 'move',
//         source:
//           '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common/helper.ts',
//         destination:
//           '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/helper.ts',
//       },
//       {
//         type: 'delete-folder',
//         path: '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common',
//       },
//     ],
//   }
// })

test.only(
  'updateFolderStructure()',
  async () => {
    await updateFolderStructure(
      path.resolve(__dirname, './__test-fixtures/basic-project/tsconfig.json'),
      path.resolve(__dirname, './__test-fixtures/basic-project/src'),
    )
  },
  { timeout: 10000000 },
)

test('buildDependencyGraph()', async () => {
  const dependencyGraph = buildDependencyGraph(
    basicProject,
    path.resolve(__dirname, './__test-fixtures/basic-project/src'),
  )

  expect(dependencyGraph).toMatchInlineSnapshot(`
    {
      "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common/helper.ts": [
        "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/index.ts",
      ],
      "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/index.ts": [],
    }
  `)
})
