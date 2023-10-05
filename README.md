# Folder Friend&nbsp;&nbsp;📁&nbsp;😃

Folder Friend is a CLI tool that analyzes the import relationships and folder structure of a given directory and calculates the necessary file/folder moves and renames needed to align your folder structure with Loom's folder structure guidelines (todo: link). You can then optionally have the CLI carry out these file operations for you.

## Installation

For now (until we publish this to npm):

1. Clone this repo
2. Install dependencies
3. Run `pnpm build`
4. Run `pnpm link` from the project root

(At this point, you can run `which folder-friend` to confirm that the binary is available globally.)

You can now run `npx folder-friend` or just `folder-friend` from anywhere on your system!

<!--
After we publish to npm, we can delete the above steps and uncomment the ones below:

You can either run via npx (no installation required):

```sh
npx folder-friend [<args>]
```

or install globally:

```sh
pnpm install -g folder-friend
```

(or npm or yarn)
 -->

## Usage

```sh
npx folder-friend [--target_dir <path>] [--yolo <boolean>]
```

- `--target_dir` (optional): The directory to operate on. Defaults to the current working directory.
- `--yolo` (optional): If false, the CLI will only print the file operations it would perform without actually performing them. You will then have the option to confirm or cancel the file operations. If true, the changes will be made immediately. Defaults to false.

## Help

To see a full overview of the CLI, run:

```sh
npx folder-friend --help
```
