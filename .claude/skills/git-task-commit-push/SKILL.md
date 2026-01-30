---
name: git-task-commit-push
description: >
  Stage all files impacted by the current task, create a well-structured commit,
  and push to the current branch, with explicit user confirmation.
# Only allow the specific git commands we want Claude to run
allowed-tools:
  - Bash(git status*)
  - Bash(git diff*)
  - Bash(git add*)
  - Bash(git commit*)
  - Bash(git push*)
argument-hint: "[task id or short description]"
model: haiku
---
# Git Task Commit & Push

You help the user commit and push work related to a specific task or ticket.

## High-level flow

1. Understand the task scope.
2. Identify impacted files.
3. Stage only those files.
4. Show a summary and get confirmation.
5. Create a good commit message.
6. Push to the current branch.

## Detailed procedure

1. **Clarify task**
   - If $ARGUMENTS is present, treat it as the task ID or short description (e.g. "ABC-123 user settings bug").
   - If $ARGUMENTS is empty, ask the user to briefly describe the task or ticket ID.

2. **Inspect current changes**
   - Run `git status -sb`.
   - Run `git diff` (for unstaged changes) and `git diff --cached` (for staged changes).
   - Present a concise summary to the user, grouped by file.

3. **Determine impacted files**
   - Infer which files are related to the task from filenames, paths, and diff content.
   - List the candidate files and ask the user to confirm or adjust the selection.
   - Never stage files the user has explicitly excluded.

4. **Stage files**
   - After confirmation, run `git add <file1> <file2> ...` with the confirmed list.
   - Avoid `git add -A` or `git add .`.

5. **Prepare commit message**
   - Analyze the diff for the staged files only (use `git diff --cached`).
   - Propose a concise, descriptive commit message (Conventional Commits style is preferred).
   - Show the proposed message and ask the user to confirm or edit it.

6. **Create commit (requires explicit approval)**
   - Only after the user confirms both the staged files and the commit message:
     - Run `git commit -m "<final commit message>"`.
   - If the commit fails (e.g. hooks), show the error and ask how to proceed.

7. **Push to remote (requires explicit approval)**
   - Show the current branch (e.g. `git rev-parse --abbrev-ref HEAD`) and the configured remote (e.g. `git remote -v`).
   - Ask the user: "Do you want to push this commit to `<remote>/<branch>` now?"
   - Only if the user clearly agrees:
     - Run `git push` (or `git push <remote> <branch>` if necessary).
   - If push fails (e.g. non-fast-forward), explain the error and ask how to proceed (do NOT force-push unless the user explicitly requests it).

## Safety guidelines
- Never modify git configuration.
- Never run force pushes (`git push --force` or `--force-with-lease`) unless the user explicitly requests it in that turn.
- If anything is unclear about scope, ask the user for clarification instead of guessing.
