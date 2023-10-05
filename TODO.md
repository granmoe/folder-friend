# Next

- Implement --yolo=false
  - Perform file changes in temp dir or otherwise simulate changes so we can show before/after
  - Will have to refactor so we can return the operations from one function, simulate changes, then perform changes separately if the user chooses to continue
  - Show before and after formatted file tree and prompt to continue or abort

# To Do

- Clean up and move to Loom repo
  - Get basic test case working
- How to handle test files? Anchor to neighboring file or enclosing folder? Analyze imports?
- Battle test this thing and add test cases here as we go! These will be crucial if we refactor away some of the GPT-4 magic.
- Handle the case where no index file exists and we need to create one / rename a file to index
- Handle async.tsx pattern
- Prob break up update-folder-structure/index.ts if it's going to need to export multiple things
- Husky hooks
- Maybe mark dirs as good so we can only look at index file and move entire dir together as we go up the tree
  - Could use git hash maybe
- Skip circular imports and print warning?

# Bells and Whistles

- Use chalk package for more fun and engaging (and potentially more readable) CLI output
