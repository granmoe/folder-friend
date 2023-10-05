import { Project } from 'ts-morph'

export const buildDependencyGraph = (project: Project, cwd: string) => {
  const dependencyGraph: { [filepath: string]: string[] } = {}

  const files = project.getSourceFiles().filter((file) => {
    return file.getFilePath().startsWith(cwd)
  })

  for (const file of files) {
    const dependents = file.getReferencingSourceFiles().filter((file) => {
      return file.getFilePath().startsWith(cwd)
    })

    dependencyGraph[file.getFilePath()] = dependents.map((dep) => {
      return dep.getFilePath()
    })
  }

  return dependencyGraph
}
