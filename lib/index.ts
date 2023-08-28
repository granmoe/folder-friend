#!/usr/bin/env node
import yargs from 'yargs/yargs'
import readline from 'readline'

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
    dry_run: {
      describe:
        'See what changes would be made, then choose to continue to exit',
      type: 'boolean',
      demandOption: false,
      default: true,
    },
  })

const main = async () => {
  const argv = await parser.argv

  const openAiApiKey = argv.openai_api_key ?? process.env.OPENAI_API_KEY
  const targetDir = argv.target_dir ?? process.cwd()
  const dryRun = argv.dry_run

  if (!openAiApiKey) {
    console.log('yo')
    throw new Error(
      'OpenAI API Key is required. Pass it in as an argument or set OPENAI_API_KEY env var.',
    )
  }

  console.log(`Running on directory: ${targetDir} ...`)

  executeMainCommand(openAiApiKey, targetDir, dryRun)
    .then(() => {
      console.log('Success!')
    })
    .catch((err) => {
      console.error('Failed with error: ', err)
    })
}

main()

async function executeMainCommand(
  openAiApiKey: string,
  targetDir: string,
  dry_run: boolean,
) {
  console.log({ openAiApiKey, targetDir, dry_run })
  if (dry_run) {
    // First gather instructions and print them, then execute
    // TODO: Going to need to separate these two things in the code

    console.log('Executing in dry run mode...')

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise<void>((resolve) => {
      rl.question('Do you want to continue? (yes/no): ', (answer) => {
        rl.close()
        if (answer.toLowerCase() === 'yes') {
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
  } else {
    // YOLO
  }
}
