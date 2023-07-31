import { Project, SourceFile } from 'ts-morph'

type ProjectOrTsConfigPath =
  | {
      tsConfigFilePath: string
      project?: never
    }
  | {
      tsConfigFilePath?: never
      project: Project
    }

export const localizeInternalDependencies = (
  projectInfo: ProjectOrTsConfigPath = { tsConfigFilePath: 'tsconfig.json' },
) => {
  const project =
    projectInfo.project ?? getProject(projectInfo.tsConfigFilePath)

  /*
    1. Build dep graph
    2. Localize any stray internal dependencies
      a. Process all files in dep graph that have only one dep
      b. Remove the file from the dep graph
      c. Keep going until the dep graph is empty
    3. Update imports
    4. Write project

    a -> b -> c
    (C depends on B, B depends on A)
    In this case, we need to process A first, then B, then C
    dep graph would look like this:
    A -> []
    B -> [A]
    C -> [B]

    Remove A from the graph since it has no dependencies
    (This means we also remove A from B's dependencies)
  */
}

export const buildDependencyGraph = (
  projectInfo: ProjectOrTsConfigPath = { tsConfigFilePath: 'tsconfig.json' },
) => {
  const project =
    projectInfo.project ?? getProject(projectInfo.tsConfigFilePath)

  const dependencyGraph: { [fileId: string]: string[] } = {}
  const dependentsCount: { [fileId: string]: number } = {}

  const files = project.getSourceFiles()
  for (const file of files) {
    const fileId = getFileId(file)
    const dependents = file.getReferencingSourceFiles()

    dependencyGraph[fileId] = dependents.map((dep) => getFileId(dep))
    dependentsCount[fileId] = dependents.length
  }

  return {
    dependencyGraph,
    dependentsCount,
  }
}

export const findStrayInternalDependencies = (
  projectInfo: ProjectOrTsConfigPath = { tsConfigFilePath: 'tsconfig.json' },
) => {
  const project =
    projectInfo.project ?? getProject(projectInfo.tsConfigFilePath)
  const files = project.getSourceFiles()

  let dir: any

  for (const file of files) {
    // console.log(file.getFilePath())
    // console.log('Dir path: ', file.getDirectoryPath())

    const _exports = file.getExportSymbols()

    for (const _export of _exports) {
      // console.log(_export.getFullyQualifiedName())
    }

    if (file.getFilePath().includes('helper') && dir) {
      file.moveToDirectory(dir)

      const referencingFiles = file.getReferencingSourceFiles()

      referencingFiles.forEach((file) => {
        file.getImportDeclarations().forEach((importDeclaration) => {
          if (importDeclaration.getModuleSpecifierSourceFile() === file) {
            importDeclaration.setModuleSpecifier(file.getFilePath())
          }
        })
      })
    } else {
      dir = file.getDirectory()
    }
  }

  return ['hi']
}

export const printProject = (
  projectInfo: ProjectOrTsConfigPath = { tsConfigFilePath: 'tsconfig.json' },
) => {
  const project =
    projectInfo.project ?? getProject(projectInfo.tsConfigFilePath)
  const rootDir = project.getRootDirectories()[0] // Assuming we will only handle single root projects for now

  const files = project.getSourceFiles()

  let output = ''
  for (const file of files) {
    output +=
      '// ' +
      file.getFilePath().replace(rootDir.getPath() + '/', '') +
      '\n' +
      file.getText() +
      '\n\n'
  }

  return output
}

let project: Project
const getProject = (tsConfigFilePath: string) => {
  if (project) return project

  project = new Project({
    tsConfigFilePath,
  })

  return project
}

const sourceFileToFileId = new Map<SourceFile, string>()
const fileIdToSourceFile = new Map<string, SourceFile>()

const getFileId = (sourceFile: SourceFile) => {
  let id = sourceFileToFileId.get(sourceFile)
  if (id) {
    return id
  }

  const filepath = sourceFile.getFilePath()
  sourceFileToFileId.set(sourceFile, filepath)
  fileIdToSourceFile.set(filepath, sourceFile)

  return filepath
}

const getSourceFileById = (id: string) => {
  return fileIdToSourceFile.get(id)
}
