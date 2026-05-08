# Git Workflow Guide

## Branch Naming Convention

```
feature/<feature-name>      # New features
bugfix/<bug-name>          # Bug fixes
refactor/<section>         # Refactoring
docs/<section>             # Documentation
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/customer-management
```

### 2. Make Changes
- Make commits frequently and with clear messages
- Each commit should represent a single logical change

### 3. Commit Messages
Use conventional commits:
```
feat: add customer list view
fix: fix customer email validation
docs: update setup guide
refactor: reorganize API routes
```

### 4. Push Changes
```bash
git push origin feature/customer-management
```

### 5. Create Pull Request
- Describe what changes were made
- Reference any related issues
- Ensure CI checks pass

### 6. Code Review
- Address review comments
- Push additional commits if needed
- Request re-review after changes

### 7. Merge
- Use "Squash and merge" for multiple commits
- Delete branch after merge

## Common Commands

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# View branches
git branch -a

# Switch branch
git checkout feature/my-feature

# View changes
git status
git diff

# Stage changes
git add .
git add <specific-file>

# Commit
git commit -m "feat: clear message of what changed"

# Push
git push origin feature/my-feature

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Undo last commit (before push)
git reset --soft HEAD~1

# Undo changes to a file
git checkout -- <file>
```

## Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

## Code Review Checklist

- [ ] Code is clear and well-documented
- [ ] No unnecessary complexity
- [ ] Follows project conventions
- [ ] Tests included
- [ ] No console.log statements (except errors)
- [ ] No hardcoded values
- [ ] Performance is acceptable
- [ ] Security considerations addressed
