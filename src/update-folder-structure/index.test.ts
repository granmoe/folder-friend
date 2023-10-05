import fs from 'fs'
import path from 'path'
import { updateFolderStructure } from '.'
import { buildFormattedFileTree } from './build-formatted-file-tree'

const testProjectsPath = path.resolve(__dirname, '../../__test-projects')
const tempTestProjectsPath = path.resolve(
  __dirname,
  '../../__test-projects-tmp',
)

beforeAll(() => {
  fs.cpSync(testProjectsPath, tempTestProjectsPath, { recursive: true })
})

afterAll(() => {
  fs.rmSync(tempTestProjectsPath, { recursive: true })
})

test('Tiny, basic project', async () => {
  const basicProjectPath = path.join(tempTestProjectsPath, '/basic-project')

  await updateFolderStructure({
    tsConfigFilePath: path.join(basicProjectPath, '/tsconfig.json'),
    directory: path.join(basicProjectPath, '/src'),
  })

  const prettyFileTree = await buildFormattedFileTree(
    path.join(basicProjectPath, '/src'),
  )

  const lines = prettyFileTree.split('\n')

  // This feels a bit brittle - need to change to assert against better structured data, like dep graph
  expect(lines).toEqual(['├── helper.ts', '└── index.ts'])
})

test.skip('Zod', async () => {
  const zodProjectPath = path.join(tempTestProjectsPath, '/zod')

  await updateFolderStructure({
    tsConfigFilePath: path.join(zodProjectPath, '/tsconfig.json'),
    directory: path.join(zodProjectPath, '/src'),
  })

  const prettyFileTree = await buildFormattedFileTree(
    path.join(zodProjectPath, '/src'),
  )

  const lines = prettyFileTree.split('\n')

  // This feels a bit brittle - need to change to assert against better structured data, like dep graph
  expect(lines).toEqual(['├── helper.ts', '└── index.ts'])
})

/*
  OTHER TEST CASES TO ADD (in the form of dep graphs)

  {
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-3.ts"]
}

---

{
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-2.ts"]
}

---

{
"/test/file-1.ts": [],
"/test/file-2.ts": [
"/test/file-1.ts",
"/test/file-3.ts"
],
"/test/nested/file-4.ts": [ "/test/nested/nested/file-5.ts"],
"/test/nested/nested/file-5.ts": [ "/test/file-1.ts"]
}
*/
