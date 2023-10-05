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
  "/src/index.ts": [],
  "/src/utilities/helper.ts": [
    "/src/index.ts",
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
  "/src/ZodError.ts": [
    "/src/errors.ts",
    "/src/external.ts",
    "/src/types.ts",
    "/src/__tests__/error.test.ts",
    "/src/__tests__/refine.test.ts",
    "/src/__tests__/tuple.test.ts",
    "/src/helpers/parseUtil.ts",
    "/src/locales/en.ts",
  ],
  "/src/__tests__/Mocker.ts": [
    "/src/__tests__/mocker.test.ts",
    "/src/__tests__/primitive.test.ts",
    "/src/benchmarks/primitives.ts",
  ],
  "/src/__tests__/all-errors.test.ts": [],
  "/src/__tests__/anyunknown.test.ts": [],
  "/src/__tests__/array.test.ts": [],
  "/src/__tests__/async-parsing.test.ts": [],
  "/src/__tests__/async-refinements.test.ts": [],
  "/src/__tests__/base.test.ts": [],
  "/src/__tests__/bigint.test.ts": [],
  "/src/__tests__/branded.test.ts": [],
  "/src/__tests__/catch.test.ts": [],
  "/src/__tests__/coerce.test.ts": [],
  "/src/__tests__/complex.test.ts": [],
  "/src/__tests__/crazySchema.ts": [
    "/src/__tests__/complex.test.ts",
  ],
  "/src/__tests__/custom.test.ts": [],
  "/src/__tests__/date.test.ts": [],
  "/src/__tests__/deepmasking.test.ts": [],
  "/src/__tests__/default.test.ts": [],
  "/src/__tests__/description.test.ts": [],
  "/src/__tests__/discriminated-unions.test.ts": [],
  "/src/__tests__/enum.test.ts": [],
  "/src/__tests__/error.test.ts": [],
  "/src/__tests__/firstparty.test.ts": [],
  "/src/__tests__/function.test.ts": [],
  "/src/__tests__/generics.test.ts": [],
  "/src/__tests__/instanceof.test.ts": [],
  "/src/__tests__/intersection.test.ts": [],
  "/src/__tests__/language-server.source.ts": [],
  "/src/__tests__/language-server.test.ts": [],
  "/src/__tests__/literal.test.ts": [],
  "/src/__tests__/map.test.ts": [],
  "/src/__tests__/masking.test.ts": [],
  "/src/__tests__/mocker.test.ts": [],
  "/src/__tests__/nan.test.ts": [],
  "/src/__tests__/nativeEnum.test.ts": [],
  "/src/__tests__/nullable.test.ts": [],
  "/src/__tests__/number.test.ts": [],
  "/src/__tests__/object-augmentation.test.ts": [],
  "/src/__tests__/object-in-es5-env.test.ts": [],
  "/src/__tests__/object.test.ts": [],
  "/src/__tests__/optional.test.ts": [],
  "/src/__tests__/parseUtil.test.ts": [],
  "/src/__tests__/parser.test.ts": [],
  "/src/__tests__/partials.test.ts": [],
  "/src/__tests__/pickomit.test.ts": [],
  "/src/__tests__/pipeline.test.ts": [],
  "/src/__tests__/primitive.test.ts": [],
  "/src/__tests__/promise.test.ts": [],
  "/src/__tests__/readonly.test.ts": [],
  "/src/__tests__/record.test.ts": [],
  "/src/__tests__/recursive.test.ts": [],
  "/src/__tests__/refine.test.ts": [],
  "/src/__tests__/safeparse.test.ts": [],
  "/src/__tests__/set.test.ts": [],
  "/src/__tests__/string.test.ts": [],
  "/src/__tests__/transformer.test.ts": [],
  "/src/__tests__/tuple.test.ts": [],
  "/src/__tests__/unions.test.ts": [],
  "/src/__tests__/validations.test.ts": [],
  "/src/__tests__/void.test.ts": [],
  "/src/benchmarks/discriminatedUnion.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/benchmarks/index.ts": [],
  "/src/benchmarks/object.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/benchmarks/primitives.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/benchmarks/realworld.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/benchmarks/string.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/benchmarks/union.ts": [
    "/src/benchmarks/index.ts",
  ],
  "/src/errors.ts": [
    "/src/external.ts",
    "/src/types.ts",
    "/src/helpers/parseUtil.ts",
  ],
  "/src/external.ts": [
    "/src/index.ts",
  ],
  "/src/helpers/enumUtil.ts": [
    "/src/types.ts",
  ],
  "/src/helpers/errorUtil.ts": [
    "/src/types.ts",
  ],
  "/src/helpers/parseUtil.ts": [
    "/src/external.ts",
    "/src/types.ts",
    "/src/__tests__/parseUtil.test.ts",
  ],
  "/src/helpers/partialUtil.ts": [
    "/src/types.ts",
  ],
  "/src/helpers/typeAliases.ts": [
    "/src/ZodError.ts",
    "/src/external.ts",
    "/src/types.ts",
  ],
  "/src/helpers/util.ts": [
    "/src/ZodError.ts",
    "/src/external.ts",
    "/src/types.ts",
    "/src/__tests__/all-errors.test.ts",
    "/src/__tests__/anyunknown.test.ts",
    "/src/__tests__/array.test.ts",
    "/src/__tests__/base.test.ts",
    "/src/__tests__/branded.test.ts",
    "/src/__tests__/catch.test.ts",
    "/src/__tests__/default.test.ts",
    "/src/__tests__/enum.test.ts",
    "/src/__tests__/error.test.ts",
    "/src/__tests__/firstparty.test.ts",
    "/src/__tests__/function.test.ts",
    "/src/__tests__/generics.test.ts",
    "/src/__tests__/instanceof.test.ts",
    "/src/__tests__/map.test.ts",
    "/src/__tests__/nativeEnum.test.ts",
    "/src/__tests__/object.test.ts",
    "/src/__tests__/partials.test.ts",
    "/src/__tests__/pickomit.test.ts",
    "/src/__tests__/primitive.test.ts",
    "/src/__tests__/promise.test.ts",
    "/src/__tests__/readonly.test.ts",
    "/src/__tests__/record.test.ts",
    "/src/__tests__/refine.test.ts",
    "/src/__tests__/set.test.ts",
    "/src/__tests__/transformer.test.ts",
    "/src/__tests__/tuple.test.ts",
    "/src/__tests__/void.test.ts",
    "/src/helpers/parseUtil.ts",
    "/src/locales/en.ts",
  ],
  "/src/index.ts": [
    "/src/ZodError.ts",
    "/src/__tests__/all-errors.test.ts",
    "/src/__tests__/anyunknown.test.ts",
    "/src/__tests__/array.test.ts",
    "/src/__tests__/async-parsing.test.ts",
    "/src/__tests__/async-refinements.test.ts",
    "/src/__tests__/base.test.ts",
    "/src/__tests__/bigint.test.ts",
    "/src/__tests__/branded.test.ts",
    "/src/__tests__/catch.test.ts",
    "/src/__tests__/coerce.test.ts",
    "/src/__tests__/crazySchema.ts",
    "/src/__tests__/custom.test.ts",
    "/src/__tests__/date.test.ts",
    "/src/__tests__/deepmasking.test.ts",
    "/src/__tests__/default.test.ts",
    "/src/__tests__/description.test.ts",
    "/src/__tests__/discriminated-unions.test.ts",
    "/src/__tests__/enum.test.ts",
    "/src/__tests__/error.test.ts",
    "/src/__tests__/firstparty.test.ts",
    "/src/__tests__/function.test.ts",
    "/src/__tests__/generics.test.ts",
    "/src/__tests__/instanceof.test.ts",
    "/src/__tests__/intersection.test.ts",
    "/src/__tests__/language-server.source.ts",
    "/src/__tests__/literal.test.ts",
    "/src/__tests__/map.test.ts",
    "/src/__tests__/masking.test.ts",
    "/src/__tests__/nan.test.ts",
    "/src/__tests__/nativeEnum.test.ts",
    "/src/__tests__/nullable.test.ts",
    "/src/__tests__/number.test.ts",
    "/src/__tests__/object-augmentation.test.ts",
    "/src/__tests__/object-in-es5-env.test.ts",
    "/src/__tests__/object.test.ts",
    "/src/__tests__/optional.test.ts",
    "/src/__tests__/parser.test.ts",
    "/src/__tests__/partials.test.ts",
    "/src/__tests__/pickomit.test.ts",
    "/src/__tests__/pipeline.test.ts",
    "/src/__tests__/primitive.test.ts",
    "/src/__tests__/promise.test.ts",
    "/src/__tests__/readonly.test.ts",
    "/src/__tests__/record.test.ts",
    "/src/__tests__/recursive.test.ts",
    "/src/__tests__/refine.test.ts",
    "/src/__tests__/safeparse.test.ts",
    "/src/__tests__/set.test.ts",
    "/src/__tests__/string.test.ts",
    "/src/__tests__/transformer.test.ts",
    "/src/__tests__/tuple.test.ts",
    "/src/__tests__/unions.test.ts",
    "/src/__tests__/validations.test.ts",
    "/src/__tests__/void.test.ts",
    "/src/benchmarks/discriminatedUnion.ts",
    "/src/benchmarks/object.ts",
    "/src/benchmarks/primitives.ts",
    "/src/benchmarks/realworld.ts",
    "/src/benchmarks/string.ts",
    "/src/benchmarks/union.ts",
    "/src/helpers/partialUtil.ts",
  ],
  "/src/locales/en.ts": [
    "/src/errors.ts",
    "/src/helpers/parseUtil.ts",
  ],
  "/src/types.ts": [
    "/src/external.ts",
  ],
}
`)
})
