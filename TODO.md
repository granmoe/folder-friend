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
