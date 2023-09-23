# Next

- Implement --yolo=false
  - Perform file changes in temp dir or otherwise simulate changes so we can show before/after
  - Will have to refactor so we can return the operations from one function, simulate changes, then perform changes separately if the user chooses to continue
  - Show before and after formatted file tree and prompt to continue or abort

# To Do

- Check if folder exists before creating and skip if so (model may not have enough info to know a folder exists or may make a mistake and try creating an existing one anyway)
- Move to Loom repo
- What to do about test files being exception in the folder structure guidelines? Prob need to add more to the prompt and examples to help model understand this (allow more flexibility for tests to do cousin imports etc)
- Battle test this thing and add test cases here as we go! These will be crucial if we refactor away some of the GPT-4 magic.
- Handle the case where no index file exists and we need to create one / rename a file to index
- Handle async.tsx pattern
- Prob break up update-folder-structure/index.ts if it's going to need to export multiple things
- Husky hooks
- Address context window limitations. Current GPT-4 8192 token context window only works for small amount of files
  - Could try GPT-3.5-16k once available (and fine-tune to get up to GPT-4 performance and not pay for examples in prompt) or GPT-4-32k if we can get access (or use openrouter.ai)
  - Maybe mark dirs as good so we can only look at their index file and move entire dir together as we go up the tree
- Add Zod + retry with guidance for GPT-4 based on errors if needed
- Skip circular imports and print warning
- Could do multiple passes to fix anything missed on earlier passes, although this would waste a lot of tokens

# Tests to Add

- Test that project path is correctly removed and then added back in to the response from OpenAI
- E2E test with OpenAI mocked
- Tests for file ops
- Tests for all code paths in updateFolderStructure
- Expand tests to cover wider variety of example projects

# Bells and Whistles

- Use chalk package for more fun and engaging (and potentially more readable) CLI output
