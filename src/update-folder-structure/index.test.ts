import path from 'path'
import { Project } from 'ts-morph'
import { buildDependencyGraph } from '.'

const repoPath = path.resolve(__dirname, '../../')

const basicProject = new Project({
  tsConfigFilePath: path.join(
    repoPath,
    '/__test-projects/basic-project/tsconfig.json',
  ),
})

const zodProject = new Project({
  tsConfigFilePath: path.join(repoPath, '/__test-projects/zod/tsconfig.json'),
})

test('creates dep graph of a tiny project', async () => {
  const dependencyGraph = buildDependencyGraph(
    basicProject,
    path.resolve(repoPath, '__test-projects/basic-project/src'),
  )

  // Strip base repo path to make tests invariant to repo location on various machines
  const updatedDependencyGraph: typeof dependencyGraph = {}
  for (const [key, value] of Object.entries(dependencyGraph)) {
    updatedDependencyGraph[key.replace(repoPath, '')] = value.map((v) =>
      v.replace(repoPath, ''),
    )
  }

  expect(updatedDependencyGraph).toMatchInlineSnapshot(`
{
  "/__test-projects/basic-project/src/index.ts": [],
  "/__test-projects/basic-project/src/utilities/helper.ts": [
    "/__test-projects/basic-project/src/index.ts",
  ],
}
`)
})

test('creates dep graph of a medium project', async () => {
  const dependencyGraph = buildDependencyGraph(
    zodProject,
    path.resolve(repoPath, '__test-projects/zod/src'),
  )

  // Strip base repo path to make tests invariant to repo location on various machines
  const updatedDependencyGraph: typeof dependencyGraph = {}
  for (const [key, value] of Object.entries(dependencyGraph)) {
    updatedDependencyGraph[key.replace(repoPath, '')] = value.map((v) =>
      v.replace(repoPath, ''),
    )
  }

  expect(updatedDependencyGraph).toMatchInlineSnapshot(`
{
  "/__test-projects/zod/src/ZodError.ts": [
    "/__test-projects/zod/src/errors.ts",
    "/__test-projects/zod/src/external.ts",
    "/__test-projects/zod/src/types.ts",
    "/__test-projects/zod/src/__tests__/error.test.ts",
    "/__test-projects/zod/src/__tests__/refine.test.ts",
    "/__test-projects/zod/src/__tests__/tuple.test.ts",
    "/__test-projects/zod/src/helpers/parseUtil.ts",
    "/__test-projects/zod/src/locales/en.ts",
  ],
  "/__test-projects/zod/src/__tests__/Mocker.ts": [
    "/__test-projects/zod/src/__tests__/mocker.test.ts",
    "/__test-projects/zod/src/__tests__/primitive.test.ts",
    "/__test-projects/zod/src/benchmarks/primitives.ts",
  ],
  "/__test-projects/zod/src/__tests__/all-errors.test.ts": [],
  "/__test-projects/zod/src/__tests__/anyunknown.test.ts": [],
  "/__test-projects/zod/src/__tests__/array.test.ts": [],
  "/__test-projects/zod/src/__tests__/async-parsing.test.ts": [],
  "/__test-projects/zod/src/__tests__/async-refinements.test.ts": [],
  "/__test-projects/zod/src/__tests__/base.test.ts": [],
  "/__test-projects/zod/src/__tests__/bigint.test.ts": [],
  "/__test-projects/zod/src/__tests__/branded.test.ts": [],
  "/__test-projects/zod/src/__tests__/catch.test.ts": [],
  "/__test-projects/zod/src/__tests__/coerce.test.ts": [],
  "/__test-projects/zod/src/__tests__/complex.test.ts": [],
  "/__test-projects/zod/src/__tests__/crazySchema.ts": [
    "/__test-projects/zod/src/__tests__/complex.test.ts",
  ],
  "/__test-projects/zod/src/__tests__/custom.test.ts": [],
  "/__test-projects/zod/src/__tests__/date.test.ts": [],
  "/__test-projects/zod/src/__tests__/deepmasking.test.ts": [],
  "/__test-projects/zod/src/__tests__/default.test.ts": [],
  "/__test-projects/zod/src/__tests__/description.test.ts": [],
  "/__test-projects/zod/src/__tests__/discriminated-unions.test.ts": [],
  "/__test-projects/zod/src/__tests__/enum.test.ts": [],
  "/__test-projects/zod/src/__tests__/error.test.ts": [],
  "/__test-projects/zod/src/__tests__/firstparty.test.ts": [],
  "/__test-projects/zod/src/__tests__/function.test.ts": [],
  "/__test-projects/zod/src/__tests__/generics.test.ts": [],
  "/__test-projects/zod/src/__tests__/instanceof.test.ts": [],
  "/__test-projects/zod/src/__tests__/intersection.test.ts": [],
  "/__test-projects/zod/src/__tests__/language-server.source.ts": [],
  "/__test-projects/zod/src/__tests__/language-server.test.ts": [],
  "/__test-projects/zod/src/__tests__/literal.test.ts": [],
  "/__test-projects/zod/src/__tests__/map.test.ts": [],
  "/__test-projects/zod/src/__tests__/masking.test.ts": [],
  "/__test-projects/zod/src/__tests__/mocker.test.ts": [],
  "/__test-projects/zod/src/__tests__/nan.test.ts": [],
  "/__test-projects/zod/src/__tests__/nativeEnum.test.ts": [],
  "/__test-projects/zod/src/__tests__/nullable.test.ts": [],
  "/__test-projects/zod/src/__tests__/number.test.ts": [],
  "/__test-projects/zod/src/__tests__/object-augmentation.test.ts": [],
  "/__test-projects/zod/src/__tests__/object-in-es5-env.test.ts": [],
  "/__test-projects/zod/src/__tests__/object.test.ts": [],
  "/__test-projects/zod/src/__tests__/optional.test.ts": [],
  "/__test-projects/zod/src/__tests__/parseUtil.test.ts": [],
  "/__test-projects/zod/src/__tests__/parser.test.ts": [],
  "/__test-projects/zod/src/__tests__/partials.test.ts": [],
  "/__test-projects/zod/src/__tests__/pickomit.test.ts": [],
  "/__test-projects/zod/src/__tests__/pipeline.test.ts": [],
  "/__test-projects/zod/src/__tests__/primitive.test.ts": [],
  "/__test-projects/zod/src/__tests__/promise.test.ts": [],
  "/__test-projects/zod/src/__tests__/readonly.test.ts": [],
  "/__test-projects/zod/src/__tests__/record.test.ts": [],
  "/__test-projects/zod/src/__tests__/recursive.test.ts": [],
  "/__test-projects/zod/src/__tests__/refine.test.ts": [],
  "/__test-projects/zod/src/__tests__/safeparse.test.ts": [],
  "/__test-projects/zod/src/__tests__/set.test.ts": [],
  "/__test-projects/zod/src/__tests__/string.test.ts": [],
  "/__test-projects/zod/src/__tests__/transformer.test.ts": [],
  "/__test-projects/zod/src/__tests__/tuple.test.ts": [],
  "/__test-projects/zod/src/__tests__/unions.test.ts": [],
  "/__test-projects/zod/src/__tests__/validations.test.ts": [],
  "/__test-projects/zod/src/__tests__/void.test.ts": [],
  "/__test-projects/zod/src/benchmarks/discriminatedUnion.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/benchmarks/index.ts": [],
  "/__test-projects/zod/src/benchmarks/object.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/benchmarks/primitives.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/benchmarks/realworld.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/benchmarks/string.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/benchmarks/union.ts": [
    "/__test-projects/zod/src/benchmarks/index.ts",
  ],
  "/__test-projects/zod/src/errors.ts": [
    "/__test-projects/zod/src/external.ts",
    "/__test-projects/zod/src/types.ts",
    "/__test-projects/zod/src/helpers/parseUtil.ts",
  ],
  "/__test-projects/zod/src/external.ts": [
    "/__test-projects/zod/src/index.ts",
  ],
  "/__test-projects/zod/src/helpers/enumUtil.ts": [
    "/__test-projects/zod/src/types.ts",
  ],
  "/__test-projects/zod/src/helpers/errorUtil.ts": [
    "/__test-projects/zod/src/types.ts",
  ],
  "/__test-projects/zod/src/helpers/parseUtil.ts": [
    "/__test-projects/zod/src/external.ts",
    "/__test-projects/zod/src/types.ts",
    "/__test-projects/zod/src/__tests__/parseUtil.test.ts",
  ],
  "/__test-projects/zod/src/helpers/partialUtil.ts": [
    "/__test-projects/zod/src/types.ts",
  ],
  "/__test-projects/zod/src/helpers/typeAliases.ts": [
    "/__test-projects/zod/src/ZodError.ts",
    "/__test-projects/zod/src/external.ts",
    "/__test-projects/zod/src/types.ts",
  ],
  "/__test-projects/zod/src/helpers/util.ts": [
    "/__test-projects/zod/src/ZodError.ts",
    "/__test-projects/zod/src/external.ts",
    "/__test-projects/zod/src/types.ts",
    "/__test-projects/zod/src/__tests__/all-errors.test.ts",
    "/__test-projects/zod/src/__tests__/anyunknown.test.ts",
    "/__test-projects/zod/src/__tests__/array.test.ts",
    "/__test-projects/zod/src/__tests__/base.test.ts",
    "/__test-projects/zod/src/__tests__/branded.test.ts",
    "/__test-projects/zod/src/__tests__/catch.test.ts",
    "/__test-projects/zod/src/__tests__/default.test.ts",
    "/__test-projects/zod/src/__tests__/enum.test.ts",
    "/__test-projects/zod/src/__tests__/error.test.ts",
    "/__test-projects/zod/src/__tests__/firstparty.test.ts",
    "/__test-projects/zod/src/__tests__/function.test.ts",
    "/__test-projects/zod/src/__tests__/generics.test.ts",
    "/__test-projects/zod/src/__tests__/instanceof.test.ts",
    "/__test-projects/zod/src/__tests__/map.test.ts",
    "/__test-projects/zod/src/__tests__/nativeEnum.test.ts",
    "/__test-projects/zod/src/__tests__/object.test.ts",
    "/__test-projects/zod/src/__tests__/partials.test.ts",
    "/__test-projects/zod/src/__tests__/pickomit.test.ts",
    "/__test-projects/zod/src/__tests__/primitive.test.ts",
    "/__test-projects/zod/src/__tests__/promise.test.ts",
    "/__test-projects/zod/src/__tests__/readonly.test.ts",
    "/__test-projects/zod/src/__tests__/record.test.ts",
    "/__test-projects/zod/src/__tests__/refine.test.ts",
    "/__test-projects/zod/src/__tests__/set.test.ts",
    "/__test-projects/zod/src/__tests__/transformer.test.ts",
    "/__test-projects/zod/src/__tests__/tuple.test.ts",
    "/__test-projects/zod/src/__tests__/void.test.ts",
    "/__test-projects/zod/src/helpers/parseUtil.ts",
    "/__test-projects/zod/src/locales/en.ts",
  ],
  "/__test-projects/zod/src/index.ts": [
    "/__test-projects/zod/src/ZodError.ts",
    "/__test-projects/zod/src/__tests__/all-errors.test.ts",
    "/__test-projects/zod/src/__tests__/anyunknown.test.ts",
    "/__test-projects/zod/src/__tests__/array.test.ts",
    "/__test-projects/zod/src/__tests__/async-parsing.test.ts",
    "/__test-projects/zod/src/__tests__/async-refinements.test.ts",
    "/__test-projects/zod/src/__tests__/base.test.ts",
    "/__test-projects/zod/src/__tests__/bigint.test.ts",
    "/__test-projects/zod/src/__tests__/branded.test.ts",
    "/__test-projects/zod/src/__tests__/catch.test.ts",
    "/__test-projects/zod/src/__tests__/coerce.test.ts",
    "/__test-projects/zod/src/__tests__/crazySchema.ts",
    "/__test-projects/zod/src/__tests__/custom.test.ts",
    "/__test-projects/zod/src/__tests__/date.test.ts",
    "/__test-projects/zod/src/__tests__/deepmasking.test.ts",
    "/__test-projects/zod/src/__tests__/default.test.ts",
    "/__test-projects/zod/src/__tests__/description.test.ts",
    "/__test-projects/zod/src/__tests__/discriminated-unions.test.ts",
    "/__test-projects/zod/src/__tests__/enum.test.ts",
    "/__test-projects/zod/src/__tests__/error.test.ts",
    "/__test-projects/zod/src/__tests__/firstparty.test.ts",
    "/__test-projects/zod/src/__tests__/function.test.ts",
    "/__test-projects/zod/src/__tests__/generics.test.ts",
    "/__test-projects/zod/src/__tests__/instanceof.test.ts",
    "/__test-projects/zod/src/__tests__/intersection.test.ts",
    "/__test-projects/zod/src/__tests__/language-server.source.ts",
    "/__test-projects/zod/src/__tests__/literal.test.ts",
    "/__test-projects/zod/src/__tests__/map.test.ts",
    "/__test-projects/zod/src/__tests__/masking.test.ts",
    "/__test-projects/zod/src/__tests__/nan.test.ts",
    "/__test-projects/zod/src/__tests__/nativeEnum.test.ts",
    "/__test-projects/zod/src/__tests__/nullable.test.ts",
    "/__test-projects/zod/src/__tests__/number.test.ts",
    "/__test-projects/zod/src/__tests__/object-augmentation.test.ts",
    "/__test-projects/zod/src/__tests__/object-in-es5-env.test.ts",
    "/__test-projects/zod/src/__tests__/object.test.ts",
    "/__test-projects/zod/src/__tests__/optional.test.ts",
    "/__test-projects/zod/src/__tests__/parser.test.ts",
    "/__test-projects/zod/src/__tests__/partials.test.ts",
    "/__test-projects/zod/src/__tests__/pickomit.test.ts",
    "/__test-projects/zod/src/__tests__/pipeline.test.ts",
    "/__test-projects/zod/src/__tests__/primitive.test.ts",
    "/__test-projects/zod/src/__tests__/promise.test.ts",
    "/__test-projects/zod/src/__tests__/readonly.test.ts",
    "/__test-projects/zod/src/__tests__/record.test.ts",
    "/__test-projects/zod/src/__tests__/recursive.test.ts",
    "/__test-projects/zod/src/__tests__/refine.test.ts",
    "/__test-projects/zod/src/__tests__/safeparse.test.ts",
    "/__test-projects/zod/src/__tests__/set.test.ts",
    "/__test-projects/zod/src/__tests__/string.test.ts",
    "/__test-projects/zod/src/__tests__/transformer.test.ts",
    "/__test-projects/zod/src/__tests__/tuple.test.ts",
    "/__test-projects/zod/src/__tests__/unions.test.ts",
    "/__test-projects/zod/src/__tests__/validations.test.ts",
    "/__test-projects/zod/src/__tests__/void.test.ts",
    "/__test-projects/zod/src/benchmarks/discriminatedUnion.ts",
    "/__test-projects/zod/src/benchmarks/object.ts",
    "/__test-projects/zod/src/benchmarks/primitives.ts",
    "/__test-projects/zod/src/benchmarks/realworld.ts",
    "/__test-projects/zod/src/benchmarks/string.ts",
    "/__test-projects/zod/src/benchmarks/union.ts",
    "/__test-projects/zod/src/helpers/partialUtil.ts",
    "/__test-projects/zod/playground.ts",
  ],
  "/__test-projects/zod/src/locales/en.ts": [
    "/__test-projects/zod/src/errors.ts",
    "/__test-projects/zod/src/helpers/parseUtil.ts",
  ],
  "/__test-projects/zod/src/types.ts": [
    "/__test-projects/zod/src/external.ts",
  ],
}
`)
})
