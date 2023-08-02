# GPT version

## Launch

- Build dep graph
  - Test
- Call OpenAI
  - Use forced function calling + Zod
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
