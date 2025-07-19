# GitHub Actions Workflows

Simple CI/CD pipeline for adv-ears project.

## Workflows

### PR Validation (`pr-validation.yml`)
Runs on pull requests to main branch:
- Installs dependencies
- Runs type check, lint, format check, and tests
- Verifies build

### Release (`release.yml`)
Runs when a version tag is pushed:
- Builds the project
- Creates GitHub release with VSCode extension
- Publishes to NPM registry
- Publishes to VSCode Marketplace

## Required Secrets
- `NPM_TOKEN`: For publishing to NPM
- `VSCE_PAT`: For publishing to VSCode Marketplace

## Branch Protection
Main branch is protected:
- Requires PR review
- PR validation must pass
- No force pushes or deletions