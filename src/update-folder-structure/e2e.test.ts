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
  await updateFolderStructure({
    tsConfigFilePath: path.join(
      tempTestProjectsPath,
      '/basic-project/tsconfig.json',
    ),
    directory: path.join(tempTestProjectsPath, '/basic-project/src'),
    openAIApiKey: process.env.OPENAI_API_KEY ?? '',
  })

  const prettyFileTree = await buildFormattedFileTree(
    path.join(tempTestProjectsPath, '/basic-project/src'),
  )

  const lines = prettyFileTree.split('\n')

  // This feels a bit brittle - need to change to assert against better structured data, like dep graph or something
  expect(lines).toEqual(['├── helper.ts', '└── index.ts'])
}, 60000)