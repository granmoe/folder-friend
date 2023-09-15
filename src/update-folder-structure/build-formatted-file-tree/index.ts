import fs from 'fs'
import path from 'path'

type TreeNode = {
  children: TreeNode[]
  path: string
}

export const buildFormattedFileTree = async (
  baseDir: string,
): Promise<string> => {
  const fileTree = await createFileTree(baseDir)

  return prettyPrintFileTree(fileTree)
}

const createFileTree = async (
  baseDir: string,
  currentDir: string = baseDir,
): Promise<TreeNode[]> => {
  const children: TreeNode[] = []

  try {
    const files = await fs.promises.readdir(currentDir)

    // Loop through each file/folder in the directory.
    for (const file of files) {
      const filePath = path.join(currentDir, file)

      const stats = await fs.promises.stat(filePath)
      if (stats.isDirectory()) {
        // If directory, recurse and add as a child node
        const childNodes = await createFileTree(baseDir, filePath)

        children.push({
          children: childNodes,
          path: file,
        })
      } else {
        // If file, add as a leaf node
        children.push({
          children: [],
          path: file,
        })
      }
    }
  } catch (error) {
    console.error(error)
  }

  return children
}

const prettyPrintFileTree = (
  nodes: TreeNode[],
  prefix: string = '',
): string => {
  let treeString = ''

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const isLastChild = i === nodes.length - 1

    const linePrefix = isLastChild ? '└── ' : '├── '

    treeString += prefix + linePrefix + node.path + '\n'

    const childPrefix =
      prefix + (isLastChild ? ' '.repeat(4) : '│' + ' '.repeat(3))

    treeString += prettyPrintFileTree(node.children, childPrefix)
  }

  return treeString.trimEnd()
}
