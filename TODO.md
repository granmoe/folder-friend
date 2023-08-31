# Next

- Add README

# Backlog

- Move to Loom repo
- Dry run: show before/after file tree, then give option to execute
  - Not really "dry run" but can't think of a better name
- Add Zod + retry with guidance for GPT-4 based on errors if needed
- Skip circular imports and print warning

# Tests to Add

- E2E test with OpenAI mocked
  - Copy entire projects to temp test dir as part of test setup
- And E2E test that calls OpenAI?
  - Would be nice to have, but need to run via separate command and never during normal test run
- Tests for file ops
- Tests for all code paths in updateFolderStructure
- Expand tests to cover wider variety of example projects
