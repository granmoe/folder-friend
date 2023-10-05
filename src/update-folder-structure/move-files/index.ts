import { Project } from 'ts-morph'

export const moveFiles = async (
  project: Project,
  dependencyGraph: Record<string, string[]>,
) => {
  for (const [filePath, dependencies] of Object.entries(dependencyGraph)) {
    if (dependencies.length === 0) {
      continue // Entry point of target folder; skip
    }

    if (dependencies.length === 1) {
      // File is an internal dependency of another file (nothing else imports it)
      const file = project.getSourceFileOrThrow(filePath)
      const dependentFile = project.getSourceFileOrThrow(dependencies[0])

      let finalDependentDir = dependentFile.getDirectory()
      if (dependentFile.getBaseNameWithoutExtension() !== 'index') {
        // Create a new directory with the dependent's file name (without extension)
        finalDependentDir = dependentFile
          .getDirectory()
          .createDirectory(dependentFile.getBaseNameWithoutExtension())

        // Rename the dependent file to index
        dependentFile.move(finalDependentDir.getPath() + '/index.ts')
      }

      // TODO: Test nesting dependent first

      // TODO: Handle name collisions here
      // Move the file (or its entire dir) next to its sole dependent
      if (file.getBaseNameWithoutExtension() === 'index') {
        // If the internal dependency is an index file, move its entire enclosing folder
        const directory = file.getDirectory()

        directory.move(finalDependentDir.getPath())
      } else {
        file.move(finalDependentDir.getPath() + '/' + file.getBaseName())
      }
    } else {
      // File is a shared file and should go into a common folder
      // TODO: Implement
    }
  }

  await project.save()
}

/*
{
  "/src/a.ts": [],
  "/src/b.ts": [
    "/src/a.ts",
  ],
  "/src/c.ts": [
    "/src/b.ts",
  ],
  "/src/d.ts": [
    "/src/c.ts",
  ],
}

src/
  a.ts
  b.ts
  c.ts
  d.ts

src/
  a.ts
  b/
    index
    c.ts
  d.ts

src/
  a/
    index.ts
    b/
      index.ts
      c/
        index.ts
        d/
          index.ts
  */
