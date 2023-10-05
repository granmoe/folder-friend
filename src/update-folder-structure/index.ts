import fs from 'fs'
import path from 'path'
import { Project } from 'ts-morph'

import { buildFormattedFileTree } from './build-formatted-file-tree'
import { buildDependencyGraph } from './build-dependency-graph'
import { moveFiles } from './move-files'
import { deleteEmptyDirectories } from './delete-empty-dirs'

export const updateFolderStructure = async ({
  tsConfigFilePath,
  directory,
}: {
  tsConfigFilePath?: string
  directory?: string
}) => {
  const dirToUpdate = directory ?? process.cwd()

  const finalTsConfigFilePath =
    tsConfigFilePath ?? findTsConfigFilePath(dirToUpdate)

  const project = getProject(finalTsConfigFilePath)

  const formattedFileTreeBefore = await buildFormattedFileTree(dirToUpdate)

  const dependencyGraph = buildDependencyGraph(project, dirToUpdate)

  await moveFiles(project, dependencyGraph)

  deleteEmptyDirectories(dirToUpdate)

  const formattedFileTreeAfter = await buildFormattedFileTree(dirToUpdate)

  console.log('SUCCESS! 🎉\n\n')

  console.log('Before: \n\n', formattedFileTreeBefore)
  console.log('After: \n\n', formattedFileTreeAfter)
}

const getProject = (tsConfigFilePath: string) => {
  if (fs.existsSync(tsConfigFilePath)) {
    const project = new Project({
      tsConfigFilePath,
    })

    return project
  } else {
    throw new Error(
      `tsconfig.json not found at ${tsConfigFilePath} - please make sure your path is correct per your working directory`,
    )
  }
}

const findTsConfigFilePath = (dir: string): string => {
  const tsConfigPath = path.join(dir, 'tsconfig.json')

  if (fs.existsSync(tsConfigPath)) {
    return tsConfigPath
  }

  // If we're at the root directory and haven't found a TS config
  if (dir === path.parse(dir).root) {
    throw new Error('tsconfig.json not found in any parent directory.')
  }

  // Move up one directory
  const parentDir = path.dirname(dir)

  return findTsConfigFilePath(parentDir)
}
