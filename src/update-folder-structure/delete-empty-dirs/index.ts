import fs from 'fs'
import path from 'path'

export const deleteEmptyDirectories = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) return

  const items = fs.readdirSync(directoryPath)

  // Recursively check child directories
  for (const item of items) {
    const itemPath = path.join(directoryPath, item)

    if (fs.statSync(itemPath).isDirectory()) {
      // Don't delete any dirs outside of the repo when running tests
      if (process.env.NODE_ENV === 'test') {
        const repoPath = path.resolve(__dirname, '../../../')

        if (!itemPath.startsWith(repoPath)) {
          continue
        }
      }

      deleteEmptyDirectories(itemPath)
    }
  }

  // After processing any child dirs, see if the directory is now empty
  if (fs.readdirSync(directoryPath).length === 0) {
    fs.rmdirSync(directoryPath)
  }
}
