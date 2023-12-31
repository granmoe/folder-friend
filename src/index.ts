#!/usr/bin/env node
import yargs from 'yargs/yargs'
import readline from 'readline'

import { updateFolderStructure } from './update-folder-structure'

const parser = yargs(process.argv.slice(2))
  .usage('$0 <cmd> [args]')
  .help('help')
  .alias('help', 'h')
  .options({
    target_dir: {
      describe:
        'Directory to optimize; no changes will be made outside of this dir - defaults to current working dir',
      type: 'string',
      demandOption: false,
    },
    yolo: {
      describe:
        'If false, you will be shown the file tree before and after changes, then prompted to actually perform the changes or exit. If true, changes will be made immediately.',
      type: 'boolean',
      demandOption: false,
      default: false,
    },
  })

const main = async () => {
  const argv = await parser.argv

  const targetDir = argv.target_dir ?? process.cwd()
  const yolo = argv.yolo

  console.log(`Running on directory: ${targetDir}`)

  runCommand(targetDir, yolo)
    .then(() => {
      console.log('Success!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Failed with error: ', err)
      process.exit(1)
    })
}

main()

async function runCommand(targetDir: string, yolo: boolean) {
  if (yolo) {
    await updateFolderStructure({
      directory: targetDir,
    })
  } else {
    // TODO: Finish implementing non-YOLO mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise<void>((resolve) => {
      rl.question('Do you want to continue? (y/n): ', (answer) => {
        rl.close()
        if (answer.toLowerCase() === 'y') {
          // If user wants to continue, execute some more logic
          console.log('Executing the main logic...')
          // Add your logic here
          resolve()
        } else {
          console.log('Exiting...')
          resolve()
        }
      })
    })
  }
}
