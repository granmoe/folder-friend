import path from 'path'
import { Project } from 'ts-morph'
import { buildDependencyGraph } from '.'

const repoPath = path.resolve(__dirname, '../../')

const basicProject = new Project({
  tsConfigFilePath: path.join(
    repoPath,
    '/__test-projects/basic-project/tsconfig.json',
  ),
})

test('creates dep graph of a tiny project', async () => {
  const dependencyGraph = buildDependencyGraph(
    basicProject,
    path.resolve(repoPath, '__test-projects/basic-project/src'),
  )

  // Strip base repo path to make tests invariant to repo location on various machines
  const updatedDependencyGraph: typeof dependencyGraph = {}
  for (const [key, value] of Object.entries(dependencyGraph)) {
    updatedDependencyGraph[key.replace(repoPath, '')] = value.map((v) =>
      v.replace(repoPath, ''),
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
