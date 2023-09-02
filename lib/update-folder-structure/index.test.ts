import * as path from 'path'
import { Project } from 'ts-morph'
import { buildDependencyGraph, updateFolderStructure } from '.'

const basicProject = new Project({
  tsConfigFilePath: path.resolve(
    __dirname,
    './__test-projects/basic-project/tsconfig.json',
  ),
})

test('buildDependencyGraph()', async () => {
  const dependencyGraph = buildDependencyGraph(
    basicProject,
    path.resolve(__dirname, './__test-projects/basic-project/src'),
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
  "/__test-projects/basic-project/src/index.ts": [],
  "/__test-projects/basic-project/src/utilities/helper.ts": [
    "/__test-projects/basic-project/src/index.ts",
  ],
}
`)
})
