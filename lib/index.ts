import { Project, SourceFile } from 'ts-morph'
import { ChatMessage } from './types'

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

  const files = project.getSourceFiles()
  for (const file of files) {
    const fileId = getFileId(file)
    const dependents = file.getReferencingSourceFiles()

    dependencyGraph[fileId] = dependents.map((dep) => getFileId(dep))
  }

  return dependencyGraph
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

const buildPrompt = (dependencyGraph: { [fileId: string]: string[] }) => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: SYSTEM_MESSAGE_CONTENT,
    },
    {
      role: 'user',
      content: dependencyGraph,
    },
  ]
}

const SYSTEM_MESSAGE_CONTENT = `You will be given information on the files in a codebase, including the paths of all files, and, for each file, a list of files that import it (its dependents).

For example, the following input:

{
  "/Users/bob/my-project/src/index.ts": [],
  "/Users/bob/my-project/src/common/helper.ts": [
    "/Users/bob/my-project/src/index.ts"
  ]
}

Means that /Users/bob/my-project/src/index.ts is not imported by anything, and /Users/bob/my-project/src/common/helper.ts is imported only by /Users/bob/my-project/src/index.ts.

Your job is to return the list of operations needed (move files, rename files, create new folders, and delete folders that will be empty after the moves) in order to make the codebase conform to the following rules:

* If a file is used by multiple other files, it must go into a common/ directory that is either a sibling or ancestor of all its dependents.
* If a file is used by only one file and the file that uses it (its dependent) is an index file (e.g. "index.ts" or "index.tsx" etc), then it must be a sibling of that file.
* If a file is used by only one file and its dependent is NOT an index file, then: 1) the dependent file should be moved into a new folder that is named after the dependent file's filename minus its extension  (e.g. "foo" for "foo.ts") 2) the dependent file should be made an index file 3) the file should be moved next to its dependent as a sibling.
* Files within a common directory should have their own dependencies localized near them per the rules above.

Here's an example. Given the following file information:

{
  "index.ts": [],
  "a/b.ts": ["index.ts"],
  "c.ts": ["a/b.ts", "e.ts"],
  "d.ts": ["index.ts"],
  "e.ts": ["d.ts"],
  "f.ts": ["d.ts"]
}

You should return the following operations, one per line:

{ "type": "move", "source": "a/b.ts", "destination": "b.ts" }
{ "type": "delete-folder", "path": "a" }
{ "type: "create-folder", "path": "common" }
{ "type": "move", "source": "c.ts", "destination": "common/c.ts" }
{ "type: "create-folder", "path": "d" }
{ "type": "move", "source": "d.ts", "destination": "d/index.ts" }
{ "type": "move", "source": "e.ts", "destination": "d/e.ts" }
{ "type": "move", "source": "f.ts", "destination": "d/f.ts" }

Another example. Given the following:

{
  "/my-app/src/index.ts": [],
  "/my-app/src/common/helper.ts": [
    "/my-app/src/index.ts"
  ]
}

You should return these operations, one per line:

{ "type": "move", "source": "/my-app/src/common/helper.ts", "destination": "/my-app/src/helper.ts" }
{ "type": "delete-folder", "path": "/my-app/src/common" }

Next, the user will give you information about their files, and you will return the list of operations per above. Remember not to delete a folder that will be empty until you've moved all files out of that folder.`
