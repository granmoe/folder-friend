import fs from 'fs'
import path from 'path'
import { Project } from 'ts-morph'
import { ChatMessage } from '../types'
import { fetchChatCompletion } from './open-ai'
import { moveFile, createFolder, deleteFolderIfEmpty } from './file-ops'
import { buildFormattedFileTree } from './build-formatted-file-tree'

export const updateFolderStructure = async (
  tsConfigFilePath?: string,
  directory?: string,
) => {
  const dirToUpdate = directory ?? process.cwd()

  const project = getProject(tsConfigFilePath)

  const dependencyGraph = buildDependencyGraph(project, dirToUpdate)
  const importsByFilePath = buildImportsByFilepath(project, dirToUpdate)

  const fileMovesPrompt = buildFileMovesPrompt(dependencyGraph)
  const fileOperationsRaw = await fetchChatCompletion(fileMovesPrompt)

  const fileOperations: FileOperation[] = fileOperationsRaw
    .split('\n')
    .map((fileOp: string) => {
      return JSON.parse(fileOp)
    })

  const fileOpOutsideOfCwdError = new Error(
    'Suggested file operation is outside of target directory.',
  )

  // ⛔️ Abort if a suggested file op is outside of cwd ⛔️
  for (const fileOperation of fileOperations) {
    switch (fileOperation.type) {
      case 'move':
        if (
          !fileOperation.source.startsWith(dirToUpdate) ||
          !fileOperation.destination.startsWith(dirToUpdate)
        ) {
          throw fileOpOutsideOfCwdError
        }
        break
      case 'delete-folder':
      case 'create-folder':
        if (!fileOperation.path.startsWith(dirToUpdate)) {
          throw fileOpOutsideOfCwdError
        }
        break
    }
  }

  const tsConfig = project.getCompilerOptions()

  const updateImportsPrompt = buildUpdateImportsPrompt(
    JSON.stringify(tsConfig),
    JSON.stringify(importsByFilePath, null, 2),
  )

  const updateImportsOperationsRaw: string = await fetchChatCompletion([
    ...fileMovesPrompt,
    ...updateImportsPrompt,
  ])

  const updateImportsOperations: UpdateImportsOperation[] =
    updateImportsOperationsRaw.split('\n').map((updateImportsOp: string) => {
      return JSON.parse(updateImportsOp)
    })

  // ⛔️ Abort if a suggested file op is outside of target dir ⛔️
  for (const updateImportsOperation of updateImportsOperations) {
    if (!updateImportsOperation.originalFilepath.includes(dirToUpdate)) {
      throw new Error(
        'Suggested import declaration update operation is for a file outside of target directory.',
      )
    }
  }

  const formattedFileTreeBefore = await buildFormattedFileTree(dirToUpdate)

  // Now that we've validated that all operations are within the target directory,
  // we can update the files...

  // ✨ UPDATE IMPORTS ✨
  for (const updateImportsOperation of updateImportsOperations) {
    if (updateImportsOperation.importUpdates.length === 0) {
      continue
    }

    if (!updateImportsOperation.originalFilepath.includes(dirToUpdate)) {
      throw new Error(
        'Suggested import declaration update operation is for a file outside of target directory.',
      )
    }

    let fileContent = fs.readFileSync(updateImportsOperation.originalFilepath, {
      encoding: 'utf-8',
    })
    let fileChanged = false
    for (const importUpdate of updateImportsOperation.importUpdates) {
      if (importUpdate.original === importUpdate.updated) {
        continue
      }

      fileChanged = true
      fileContent = fileContent.replace(
        importUpdate.original,
        importUpdate.updated,
      )
    }

    if (fileChanged) {
      fs.writeFileSync(updateImportsOperation.originalFilepath, fileContent, {
        encoding: 'utf-8',
      })
    }
  }

  // ✨ PERFORM FILE/FOLDER MOVES ✨
  for (const fileOperation of fileOperations) {
    if (fileOperation.type === 'move') {
      await moveFile(fileOperation.source, fileOperation.destination)
    } else if (fileOperation.type === 'create-folder') {
      await createFolder(fileOperation.path)
    } else if (fileOperation.type === 'delete-folder') {
      try {
        await deleteFolderIfEmpty(fileOperation.path)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const formattedFileTreeAfter = await buildFormattedFileTree(dirToUpdate)

  console.log('SUCCESS! 🎉\n\n')

  console.log('Before: \n\n', formattedFileTreeBefore)
  console.log('After: \n\n', formattedFileTreeAfter)
}

let project: Project
const getProject = (tsConfigFilePath?: string) => {
  if (tsConfigFilePath) {
    if (fs.existsSync(tsConfigFilePath)) {
      project = new Project({
        tsConfigFilePath,
      })

      return project
    } else {
      throw new Error(
        `tsconfig.json not found at ${tsConfigFilePath} - please make sure your path is correct per your working directory`,
      )
    }
  }

  const foundTsConfigFilePath = findTsConfigFilePath(process.cwd())

  project = new Project({
    tsConfigFilePath: foundTsConfigFilePath,
  })

  return project
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

export const buildDependencyGraph = (project: Project, cwd: string) => {
  const dependencyGraph: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  for (const file of files) {
    const dependents = file.getReferencingSourceFiles()

    dependencyGraph[file.getFilePath()] = dependents.map((dep) => {
      return dep.getFilePath()
    })
  }

  return dependencyGraph
}

export const buildImportsByFilepath = (project: Project, cwd: string) => {
  const importsByFilepath: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  for (const file of files) {
    importsByFilepath[file.getFilePath()] = file
      .getImportDeclarations()
      .map((imp) => imp.getText())
  }

  return importsByFilepath
}

const buildFileMovesPrompt = (dependencyGraph: {
  [fileId: string]: string[]
}) => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: FILE_MOVES_SYSTEM_MESSAGE_CONTENT,
    },
    {
      role: 'user',
      content: JSON.stringify(dependencyGraph),
    },
  ]

  return messages
}

const buildUpdateImportsPrompt = (
  tsConfig: string,
  importsByFilepath: string,
) => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: buildUpdateImportsSystemMessageContent(
        tsConfig,
        importsByFilepath,
      ),
    },
  ]

  return messages
}

const buildUpdateImportsSystemMessageContent = (
  tsConfig: string,
  importsByFilepath: string,
) => `Now, using the TS config and file snippets of the files below, please update the imports of each file per the instructions you returned. (The files are referred to by their original paths, but they have been moved.)

Return one JSON object per line (one for each file) that adheres to this structure ("originalFilepath" is the filepath before the instructions above have been carried out):

{ "originalFilepath": "/example/file.tsx", "importUpdates": [{ "original": "import { foo } from './helpers/foo'", "updated": "import { foo } from './foo'" }, { "original": "import { bar } from '../../bar'", "updated": "import { bar } from './bar'" }] }

Example response:
{ "originalFilepath": "/example/index.tsx", "importUpdates": [{ "original": "import { a } from './a/a'", "updated": "import { a } from './a'" }, { "original": "import { b } from 'foo/b'", "updated": "import { b } from 'common/b'" ] }
{ "originalFilepath": "/example/a.tsx", "importUpdates": [{ "original": "import { b } from '/foo/b'", "updated": "import { b } from 'common/b'" }] }

If an import does not need to be changed, then omit it. If a file does not require any import updates at all, then omit this file from your response.

TS config:
\`\`\`
${tsConfig}
\`\`\`

Original imports by original filepath:
${importsByFilepath}
`

const FILE_MOVES_SYSTEM_MESSAGE_CONTENT = `You will be given information on the files in a codebase, including the paths of all files, and, for each file, a list of files that import it (its dependents).

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

And if a file is separated from its dependent via unnecessary nesting, like this:

{
  "/src/index.ts": [],
  "/src/a/b/c/helper.ts": [
    "/src/index.ts"
  ]
}

You should move it next to its dependent by returning this:

{ "type": "move", "source": "/src/a/b/c/helper.ts", "destination": "/src/helper.ts" }
{ "type": "delete-folder", "path": "/src/a/b/c" }

Next, the user will give you information about their files, and you will return the list of operations per above. Remember not to delete a folder that will be empty until you've moved all files out of that folder.`

type FileOperation =
  | {
      type: 'move'
      source: string
      destination: string
    }
  | {
      type: 'delete-folder'
      path: string
    }
  | {
      type: 'create-folder'
      path: string
    }

type UpdateImportsOperation = {
  originalFilepath: string
  importUpdates: { original: string; updated: string }[]
}
