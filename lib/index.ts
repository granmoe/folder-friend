#!/usr/bin/env node
import yargs from 'yargs/yargs'
import readline from 'readline'

import { updateFolderStructure } from './update-folder-structure'

const parser = yargs(process.argv.slice(2))
  .usage('$0 <cmd> [args]')
  .help('help')
  .alias('help', 'h')
  .options({
    openai_api_key: {
      describe: 'OpenAI API Key - defaults to OPENAI_API_KEY env var',
      type: 'string',
      demandOption: false,
    },
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

  const openAIApiKey = argv.openai_api_key ?? process.env.OPENAI_API_KEY
  const targetDir = argv.target_dir ?? process.cwd()
  const yolo = argv.yolo

  if (!openAIApiKey) {
    console.error(
      'OpenAI API Key is required. Pass it in as an argument or set OPENAI_API_KEY env var.',
    )
    process.exit(1)
  }

  console.log(`Running on directory: ${targetDir}`)

  runCommand(openAIApiKey, targetDir, yolo)
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

async function runCommand(
  openAIApiKey: string,
  targetDir: string,
  yolo: boolean,
) {
  if (yolo) {
    await updateFolderStructure({
      openAIApiKey,
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
