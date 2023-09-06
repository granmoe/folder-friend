# Next

- Implement --yolo=false
  - Perform file changes in temp dir or otherwise simulate changes so we can show before/after
  - Will have to refactor so we can return the operations from one function, simulate changes, then perform changes separately if the user chooses to continue
  - Show before and after formatted file tree and prompt to continue or abort

# Backlog

- Move to Loom repo
- Prob break up update-folder-structure/index.ts if it's going to need to export multiple things
- Husky hooks
- Address context window limitations
  - Maybe mark dirs as good so we can only look at their index file and move entire dir together as we go up the tree
  - Consider using a fine-tuned GPT-3.5. 16k context window coming "this fall," which is 4x more tokens.
- Add Zod + retry with guidance for GPT-4 based on errors if needed
- Skip circular imports and print warning

# Tests to Add

- E2E test with OpenAI mocked
- Tests for file ops
- Tests for all code paths in updateFolderStructure
- Expand tests to cover wider variety of example projects

# Bells and Whistles

- Use chalk package for more fun and engaging (and potentially more readable) CLI output
