import fs from 'fs'
import path from 'path'
import { updateFolderStructure } from '.'

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
  // TODO: Also put these into consts in module scope because it would be really bad to operate on the wrong dir!
  await updateFolderStructure({
    tsConfigFilePath: path.join(
      tempTestProjectsPath,
      '/basic-project/tsconfig.json',
    ),
    directory: path.join(tempTestProjectsPath, '/basic-project/src'),
    openAIApiKey: process.env.OPENAI_API_KEY ?? '',
  })

  // TODO: Get file tree for folder and assert on it

  expect(true).toBe(true)
}, 60000)
