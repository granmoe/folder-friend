import { expect, test } from 'vitest'
import path from 'path'
import { buildDependencyGraph, localizeInternalDependencies } from './'

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

  expect(dependencyGraph).toMatchInlineSnapshot(`
    {
      "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common/helper.ts": [
        "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/index.ts",
      ],
      "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/index.ts": [],
    }
  `)

  // { "type": "move", "source": "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common/helper.ts", "destination": "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/helper.ts" }
  // { "type": "delete-folder", "path": "/Users/mattgranmoe/code/folder-friend/lib/__test-fixtures/basic-project/src/common" }
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
