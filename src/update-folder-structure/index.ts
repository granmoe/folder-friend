import fs from 'fs'
import path from 'path'
import { Project } from 'ts-morph'
import { ChatMessage } from '../types'
import { fetchChatCompletion } from './open-ai'
import { moveFile, createFolder, deleteFolderIfEmpty } from './file-ops'
import { buildFormattedFileTree } from './build-formatted-file-tree'

export const updateFolderStructure = async ({
  openAIApiKey,
  tsConfigFilePath,
  directory,
}: {
  openAIApiKey: string
  tsConfigFilePath?: string
  directory?: string
}) => {
  const dirToUpdate = directory ?? process.cwd()

  const finalTsConfigFilePath =
    tsConfigFilePath ?? findTsConfigFilePath(dirToUpdate)

  const project = getProject(finalTsConfigFilePath)

  const projectPath = path.dirname(finalTsConfigFilePath)

  const dependencyGraph = buildDependencyGraph(
    project,
    dirToUpdate,
    projectPath,
  )
  const importsByFilePath = buildImportsByFilepath(
    project,
    dirToUpdate,
    projectPath,
  )

  // Get file operations from GPT-4
  const fileMovesPrompt = buildFileMovesPrompt(dependencyGraph)
  const fileOperationsRaw = await fetchChatCompletion(
    fileMovesPrompt,
    openAIApiKey,
  )

  const fileOperations: FileOperation[] = fileOperationsRaw
    .split('\n')
    .map((fileOp: string) => {
      const parsedFileOperation: FileOperation = JSON.parse(fileOp)

      if (parsedFileOperation.type === 'move') {
        parsedFileOperation.source = path.join(
          projectPath,
          parsedFileOperation.source,
        )

        parsedFileOperation.destination = path.join(
          projectPath,
          parsedFileOperation.destination,
        )
      }

      if (parsedFileOperation.type === 'create-folder') {
        parsedFileOperation.path = path.join(
          projectPath,
          parsedFileOperation.path,
        )
      }

      if (parsedFileOperation.type === 'delete-folder') {
        parsedFileOperation.path = path.join(
          projectPath,
          parsedFileOperation.path,
        )
      }
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
    JSON.stringify(importsByFilePath),
  )

  const updateImportsOperationsRaw: string = await fetchChatCompletion(
    [...fileMovesPrompt, ...updateImportsPrompt],
    openAIApiKey,
  )

  const updateImportsOperations: UpdateImportsOperation[] =
    updateImportsOperationsRaw.split('\n').map((updateImportsOp: string) => {
      const updateImportsOperation: UpdateImportsOperation =
        JSON.parse(updateImportsOp)

      // Add back project path
      updateImportsOperation.originalFilepath = path.join(
        projectPath,
        updateImportsOperation.originalFilepath,
      )

      return updateImportsOperation
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
  projectPath: string,
) => {
  const dependencyGraph: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  for (const file of files) {
    const dependents = file.getReferencingSourceFiles()

    // We omit the path to the project and then add it back when doing file ops
    // so that we can save a bunch of tokens in the OpenAI API calls
    dependencyGraph[file.getFilePath().replace(projectPath, '')] =
      dependents.map((dep) => {
        return dep.getFilePath().replace(projectPath, '')
      })
  }

  return dependencyGraph
}

export const buildImportsByFilepath = (
  project: Project,
  cwd: string,
  projectPath: string,
) => {
  const importsByFilepath: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  // We omit the path to the project and then add it back when doing file ops
  // so that we can save a bunch of tokens in the OpenAI API calls
  for (const file of files) {
    importsByFilepath[file.getFilePath().replace(projectPath, '')] = file
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
  "/my-project/src/index.ts": [],
  "/my-project/src/common/helper.ts": [
    "/my-project/src/index.ts"
  ]
}

Means that /my-project/src/index.ts is not imported by anything, and /my-project/src/common/helper.ts is imported only by /my-project/src/index.ts.

Your job is to return the list of operations needed (move files, create new folders, and delete folders that will be empty after the moves), one per line (and no other output), in order to make the folder structure conform to these rules:

* If a file is used by multiple other files, it must go into a common/ directory that is either a sibling or ancestor of all its dependents.
* If a file is used by only one other file, it should be encapsulated in a folder with its dependent as a sibling where the dependent is an index file.
* Files within a common directory should have their own dependencies localized near them per the rules above.

A few finer points:

* If you encounter naming collisions, append a simple suffix like "-1" to files/folders to disambiguate (or rename a file that shouldn't be an index file to be named "temp-file-name-1" so that you can make another file in that folder the index file if the rules require it).
* Always put any "create-folder" commands first
* Always put any "delete-folder" commands last

Below are some examples ("IN" is a user message and "OUT" is your expected response).

---
IN:
{
  "index.ts": [],
  "a/b.ts": ["index.ts"],
  "c.ts": ["a/b.ts", "e.ts"],
  "d.ts": ["index.ts"],
  "e.ts": ["d.ts"],
  "f.ts": ["d.ts"]
}
OUT:
{ "type": "move", "source": "a/b.ts", "destination": "b.ts" }
{ "type: "create-folder", "path": "common" }
{ "type": "move", "source": "c.ts", "destination": "common/c.ts" }
{ "type: "create-folder", "path": "d" }
{ "type": "move", "source": "d.ts", "destination": "d/index.ts" }
{ "type": "move", "source": "e.ts", "destination": "d/e.ts" }
{ "type": "move", "source": "f.ts", "destination": "d/f.ts" }
{ "type": "delete-folder", "path": "a" }
---
IN:
{
  "/my-app/src/index.ts": [],
  "/my-app/src/common/helper.ts": [
    "/my-app/src/index.ts"
  ]
}
OUT:
{ "type": "move", "source": "/my-app/src/common/helper.ts", "destination": "/my-app/src/helper.ts" }
{ "type": "delete-folder", "path": "/my-app/src/common" }
---
IN:
{
  "/src/index.ts": [],
  "/src/a/b/c/helper.ts": [
    "/src/index.ts"
  ]
}
OUT:
{ "type": "move", "source": "/src/a/b/c/helper.ts", "destination": "/src/helper.ts" }
{ "type": "delete-folder", "path": "/src/a/b/c" }
---
IN:
{
  "/comments/index.ts": [],
  "/comments/common/new-comment.ts": [
    "/comments/index.ts"
  ],
  "/comments/header/settings/settings-button.ts": ["/comments/header/header.ts"],
  "/comments/header/settings/gear-icon.ts": ["/comments/header/settings/settings-button.ts"],
  "comments/header/header.ts": ["/comments/index.ts"],
  "/comments/header/comment-list.ts": ["/comments/header/header.ts"]
}
OUT:
{ "type": "move", "source": "/comments/common/new-comment.ts", "destination": "/comments/new-comment.ts" }
{ "type": "move", "source": "comments/header/header.ts", "destination": "/comments/header/index.ts" }
{ "type": "create-folder", "path": "/comments/settings-button" }
{ "type": "move", "source": "/comments/settings/settings-button.ts", "destination": "/comments/settings-button/index.ts" }
{ "type": "move", "source": "/comments/settings/gear-icon", "destination": "/comments/settings-button/gear-icon.ts" }
{ "type": "delete-folder", "path": "/comments/settings" }
{ "type": "delete-folder", "path": "/comments/common" }
---
IN:
{
  "/a/b.ts": [],
  "/a/b/c/d.ts": [
    "/a/b.ts"
  ],
  "/a/b/c/e.ts": ["/a/b/c/d.ts"],
}
OUT:
{ "type": "create-folder", "path": "/a/b/d" }
{ "type": "move", "source": "/a/b/c/d.ts", "destination": "/a/b/d/index.ts" }
{ "type": "move", "source": "/a/b/c/e.ts", "destination": "/a/b/d/e.ts" }
{ "type": "delete-folder", "path": "/a/b/c" }`

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
