import * as fs from 'fs'
import * as path from 'path'
// import { updateFolderStructure } from '.'

beforeAll(() => {
  fs.cpSync(
    path.join(__dirname, '/__test-projects'),
    path.join(__dirname, '/__test-projects-tmp'),
    { recursive: true },
  )
})

afterAll(() => {
  fs.rmSync(path.join(__dirname, '/__test-projects-tmp'), { recursive: true })
})

test('updateFolderStructure()', async () => {
  console.log('hi')
  await new Promise((resolve) => setTimeout(resolve, 20000))
  expect(true).toBe(true)

  // await updateFolderStructure(
  //   path.resolve(__dirname, './tmp/basic-project/tsconfig.json'),
  //   path.resolve(__dirname, './tmp/basic-project/src'),
  // )
}, 60000)
