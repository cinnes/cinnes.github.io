# Git Hooks

This directory contains custom git hooks for maintaining code quality and consistency.

## Available Hooks

### Pre-commit (`pre-commit`)
Runs on every commit before the commit is created:
- Lints and formats staged files with ESLint and Prettier
- Runs TypeScript type checking
- Executes tests for affected files

### Pre-push (`pre-push`)
Runs before pushing to remote repository:
- Full ESLint check on entire codebase
- TypeScript type checking
- Full test suite execution
- Code formatting validation
- Production build test

### Commit Message (`commit-msg`)
Validates commit message format:
- Enforces Conventional Commits specification
- Ensures consistent commit message format
- Validates commit types and structure

## Setup

These hooks are managed by Husky and will be automatically installed when you run `npm install`.

## Manual Setup (Alternative)

If you prefer to use these hooks without Husky:

```bash
# Copy hooks to .git/hooks directory
cp .githooks/* .git/hooks/

# Make them executable
chmod +x .git/hooks/*
```

## Bypassing Hooks

In exceptional cases, you can bypass hooks:

```bash
# Skip pre-commit hooks
git commit --no-verify

# Skip pre-push hooks
git push --no-verify
```

**Note:** Only bypass hooks when absolutely necessary and ensure code quality through other means.