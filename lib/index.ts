import { Project } from 'ts-morph'

export const hi = () => 'yo'

let project: Project
const getProject = (tsConfigFilePath: string) => {
  if (project) return project

  project = new Project({
    tsConfigFilePath,
  })

  return project
}

export const findOrphanedDependencies = (
  {
    tsConfigFilePath,
  }: {
    tsConfigFilePath: string
  } = { tsConfigFilePath: 'tsconfig.json' },
) => {
  const project = getProject(tsConfigFilePath)
  const files = project.getSourceFiles()

  for (const file of files) {
    console.log(file.getFilePath())
  }

  return ['hi']
}
