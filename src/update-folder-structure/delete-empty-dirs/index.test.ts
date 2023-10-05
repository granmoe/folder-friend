import fs from 'fs'
import path from 'path'
import { deleteEmptyDirectories } from '.'

const tempTestProjectsPath = path.resolve(
  __dirname,
  '../../__delete-empty-dirs-tmp',
)

beforeAll(() => {
  fs.mkdirSync(tempTestProjectsPath)
})

afterAll(() => {
  fs.rmSync(tempTestProjectsPath, { recursive: true })
})

test('It should delete empty directories', () => {
  const testDirPath = path.join(tempTestProjectsPath, '/empty-dirs-test')

  fs.mkdirSync(testDirPath, { recursive: true })
  const emptyDirPath = path.join(testDirPath, '/empty-dir')
  fs.mkdirSync(emptyDirPath)

  deleteEmptyDirectories(testDirPath)

  expect(fs.existsSync(emptyDirPath)).toBe(false)
  expect(fs.existsSync(testDirPath)).toBe(true)
})

test.todo('It should handle nested empty directories', () => {
  // Create test directory structure
  const testDirectoryPath = path.join(
    tempTestProjectsPath,
    '/nested-empty-test',
  )
  fs.mkdirSync(testDirectoryPath, { recursive: true })
  fs.mkdirSync(path.join(testDirectoryPath, '/empty-dir'))
  fs.mkdirSync(path.join(testDirectoryPath, '/empty-dir/empty-sub-dir'))
  fs.writeFileSync(path.join(testDirectoryPath, '/file.txt'), 'Hello World')

  // Execute the function
  deleteEmptyDirectories(testDirectoryPath)

  // Assert that both nested empty directories are deleted
  expect(fs.existsSync(path.join(testDirectoryPath, '/empty-dir'))).toBe(false)
  expect(
    fs.existsSync(path.join(testDirectoryPath, '/empty-dir/empty-sub-dir')),
  ).toBe(false)
  // Assert that non-empty parent directory still exists
  expect(fs.existsSync(testDirectoryPath)).toBe(true)
})

test.todo('It should not delete directories with files', () => {
  // Create test directory structure
  const testDirectoryPath = path.join(tempTestProjectsPath, '/non-empty-test')
  fs.mkdirSync(testDirectoryPath, { recursive: true })
  fs.mkdirSync(path.join(testDirectoryPath, '/dir-with-file'))
  fs.writeFileSync(
    path.join(testDirectoryPath, '/dir-with-file/file.txt'),
    'Hello World',
  )

  // Execute the function
  deleteEmptyDirectories(testDirectoryPath)

  // Assert that directory with a file is not deleted
  expect(fs.existsSync(path.join(testDirectoryPath, '/dir-with-file'))).toBe(
    true,
  )
  expect(
    fs.existsSync(path.join(testDirectoryPath, '/dir-with-file/file.txt')),
  ).toBe(true)
})
