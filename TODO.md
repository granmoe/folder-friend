# GPT version

- Some way to e2e test with an example project and reset at the end
  - Seed project at the start each time, then delete everything in its dir at the end

## Make an OpenAI utility package

- What to do on error
  - Retries on error with feedback
- Retry on 429 via axios-retry
- How to handle running out of tokens

Example usage:

```ts
fetchChatCompletion<TCompletionType>(messages, {
  temperature: 0.5,
  minResponseTokens: 100,
  truncateMessages: (messages, overage) => {
    // truncate messages
    return messages.slice(1)
  },
  validateResponse: (completion, retryWithFeedback): TCompletionType => {
    // do some validation
    // return completion, throw error, or call retryWithFeedback(message)
    // Somehow, if we pass a Zod schema, the function should return this as the type (maybe use a generic)
  },
  retries: 2,
})
```

## Old notes

localizeInternalDependencies

- Setup project
-
- For each file:
- Find stray internal dependencies
- Move files
- Update imports
-
- Write project
- To do: what if a file has an internal dep but is also the internal dep of another file? Need to build dep graph and do in order of topological sort

- Skip if circular import
- Handle common deps in another function that can be called separately or can do both at once in two passes
- Need to track other imports of moved file and update them using relative helper thing

FF: start with just finding files with one export and one dependent and put in a (potentially new, if not index) folder with their dependent. Then can check if index has one export only and one dependent and put as sibling if dep is index or nest dep and convert to index etc.

This could potentially go a long ways.

---

## Launch

- Build dep graph
  - Test
- Call OpenAI
  - Use forced function calling + Zod? Already getting good output, so maybe just Zod + retry with explanation of error for GPT-4 if needed
  - Mock in tests
- Ignore instructions that operate on files outside of TS project
  - Test
- Execute instructions
- Build and test locally somehow on some various repos
- Get tsconfig recursively
- Need to support running only in current directory

## Post-Launch

- E2E test?
- Support optional CLI arg to pass OpenAI key

---

# Old

localizeInternalDependencies

- Setup project
- For each file:

- CHECK Build dependency graph

  - For each file, find its dependents and put it in the graph ({ [file]: dependents[] })
    - Use this to find stray internal dependencies (dep is internal if )
      - Handle case where file is in a subdirectory and exported from an index file

- Move files
- Update imports
- Write project

- To do: what if a file has an internal dep but is also the internal dep of another file? Need to build dep graph and do in order of topological sort

- Skip if circular import
- Handle common deps in another function that can be called separately or can do both at once in two passes
- Need to track other imports of moved file and update them using relative helper thing

- Package as CLI
