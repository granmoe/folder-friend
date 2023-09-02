# 😃 📁 Folder Friend 📁 😃

Folder Friend is a CLI tool that analyzes the import relationships and folder structure of a given directory and calculates the necessary file/folder moves and renames needed to align your folder structure with Loom's folder structure guidelines (todo: link). You can then optionally have the CLI carry out these file operations for you.

## Installation

You can either run via npx (no installation required):

```sh
npx folder-friend [<args>]
```

or install globally:

```sh
pnpm install -g folder-friend
```

(or npm or yarn)

## Usage

```sh
npx folder-friend [--target_dir <path>] [--dry_run <boolean>] [--openai_api_key <key>]
```

- `--target_dir` (optional): The directory to operate on. Defaults to the current working directory.
- `--dry_run` (optional): If true, the CLI will only print the file operations it would perform without actually performing them. You will then have the option to confirm or cancel the file operations. Defaults to true.
- `--openai_api_key` (optional): Your OpenAI API key. If not provided, the OPENAI_API_KEY environment variable will be used.

## Help

To see a full overview of the CLI, run:

```sh
npx folder-friend --help
```
