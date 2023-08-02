import { expect, test } from 'vitest'
import path from 'path'
import { buildDependencyGraph } from './'

const basicProjectTsConfigFilePath = path.resolve(
  __dirname,
  './__test-fixtures/basic-project/tsconfig.json',
)

// TODO:
// * Check imports are correct in one test
// * Check file tree is correct in one test
// * Check various problem cases: circular files, etc.

test('buildDependencyGraph()', () => {
  const dependencyGraph = buildDependencyGraph({
    tsConfigFilePath: basicProjectTsConfigFilePath,
  })

  console.log(dependencyGraph)

  // expect(dependencyGraph.size).toBe(4)
  // expect(dependentsCount.size).toBe(4)
})

/*
a/
  b.ts
index.ts
c.ts
d.ts
e.ts
f.ts

common/
  c.ts
d/
  index.ts
  e.ts
  f.ts
b.ts

index.tsx
components/
  header.tsx
  footer.tsx
sidebar.tsx
footer-button.tsx
hooks/
  use-auth.ts

{
  "index.ts": {
    imports: ["header.tsx", "footer.tsx", "sidebar.tsx"]
  },
  "components/header.tsx": {
    imports: ["use-auth.ts"]
  },
  "components/footer.tsx": {
    imports: ["footer-button.tsx"]
  },
  "sidebar.tsx": {
    imports: ["use-auth.ts"]
  },
  "footer-button.tsx": {
    imports: []
  },
  "hooks/use-auth.ts": {
    imports: []
  }
}
*/
