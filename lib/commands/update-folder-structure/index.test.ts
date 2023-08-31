import * as path from 'path'
import { Project } from 'ts-morph'
import { buildDependencyGraph, updateFolderStructure } from '.'

const basicProject = new Project({
  tsConfigFilePath: path.resolve(
    __dirname,
    './__test-fixtures/basic-project/tsconfig.json',
  ),
})

jest.mock('./open-ai', () => {
  return {
    fetchChatCompletion: async () => [
      {
        type: 'move',
        source:
          '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common/helper.ts',
        destination:
          '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/helper.ts',
      },
      {
        type: 'delete-folder',
        path: '/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common',
      },
    ],
  }
})

test.skip('updateFolderStructure()', async () => {
  await updateFolderStructure(
    path.resolve(__dirname, './__test-fixtures/basic-project/tsconfig.json'),
    path.resolve(__dirname, './__test-fixtures/basic-project/src'),
  )
})

test('buildDependencyGraph()', async () => {
  const dependencyGraph = buildDependencyGraph(
    basicProject,
    path.resolve(__dirname, './__test-fixtures/basic-project/src'),
  )

  // Strip __dirname to make tests invariant to repo location on various machines
  const updatedDependencyGraph: typeof dependencyGraph = {}
  for (const [key, value] of Object.entries(dependencyGraph)) {
    updatedDependencyGraph[key.replace(__dirname, '')] = value.map((v) =>
      v.replace(__dirname, ''),
    )
  }

  expect(updatedDependencyGraph).toMatchInlineSnapshot(`
{
  "/__test-fixtures/basic-project/src/index.ts": [],
  "/__test-fixtures/basic-project/src/utilities/helper.ts": [
    "/__test-fixtures/basic-project/src/index.ts",
  ],
}
`)
})
