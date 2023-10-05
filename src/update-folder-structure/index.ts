import fs from 'fs'
import path from 'path'
import { Project } from 'ts-morph'
import { buildFormattedFileTree } from './build-formatted-file-tree'
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

  for (const [filePath, dependencies] of Object.entries(dependencyGraph)) {
    if (dependencies.length === 0) {
      continue // Entry point of target folder; skip
    }

    if (dependencies.length === 1) {
      // File is an internal dependency of another file (nothing else imports it)
      const file = project.getSourceFileOrThrow(filePath)
      const dependentFile = project.getSourceFileOrThrow(dependencies[0])

      let finalDependentDir = dependentFile.getDirectory()
      if (dependentFile.getBaseNameWithoutExtension() !== 'index') {
        // Create a new directory with the dependent's file name (without extension)
        finalDependentDir = dependentFile
          .getDirectory()
          .createDirectory(dependentFile.getBaseNameWithoutExtension())

        // Rename the dependent file to index
        dependentFile.move(finalDependentDir.getPath() + '/index.ts')
      }

      // TODO: Test nesting dependent first

      // TODO: Handle name collisions here
      // Move the file (or its entire dir) next to its sole dependent
      if (file.getBaseNameWithoutExtension() === 'index') {
        // If the internal dependency is an index file, move its entire enclosing folder
        const directory = file.getDirectory()

        directory.move(finalDependentDir.getPath())
      } else {
        file.move(finalDependentDir.getPath() + '/' + file.getBaseName())
      }
    } else {
      // File is a shared file and should go into a common folder
      // TODO: Implement
    }
  }

  await project.save()

  deleteEmptyDirectories(dirToUpdate)

  await new Promise((resolve) => setTimeout(resolve, 20000))

  /*
{
  "/src/a.ts": [],
  "/src/b.ts": [
    "/src/a.ts",
  ],
  "/src/c.ts": [
    "/src/b.ts",
  ],
  "/src/d.ts": [
    "/src/c.ts",
  ],
}

src/
  a.ts
  b.ts
  c.ts
  d.ts

src/
  a.ts
  b/
    index
    c.ts
  d.ts

src/
  a/
    index.ts
    b/
      index.ts
      c/
        index.ts
        d/
          index.ts
  */

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

export const buildDependencyGraph = (
  project: Project,
  cwd: string,
  // projectPath: string,
) => {
  const dependencyGraph: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  for (const file of files) {
    const dependents = file.getReferencingSourceFiles().filter((file) => {
      return file.getFilePath().startsWith(cwd)
    })

    // We omit the path to the project and then add it back when doing file ops
    // so that we can save a bunch of tokens in the OpenAI API calls
    // dependencyGraph[file.getFilePath().replace(projectPath, '')] =
    dependencyGraph[file.getFilePath()] = dependents.map((dep) => {
      // return dep.getFilePath().replace(projectPath, '')
      return dep.getFilePath()
    })
  }

  return dependencyGraph
}
