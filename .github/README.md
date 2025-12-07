# GitHub Documentation

This directory contains comprehensive documentation for GitHub Copilot agents and contributors.

## 📚 Documentation Files

### For GitHub Copilot Agents

**[copilot-instructions.md](copilot-instructions.md)** - Main documentation
- Complete project architecture
- Meta-prompt system explanation
- Database schema
- API endpoints
- Key flows and conventions
- Common issues and solutions

**[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide
- Common tasks (add endpoint, table, page)
- Code snippets
- File locations
- Commands
- Design system classes
- Debugging tips

**[code-style.md](code-style.md)** - Code style guide
- Python/Flask patterns
- React/JavaScript patterns
- Naming conventions
- Error handling
- Testing patterns
- Security best practices

### For Contributors

**[CONTRIBUTING.md](CONTRIBUTING.md)** - Contributing guide
- Development workflow
- PR guidelines
- Code review process
- Bug report templates
- Feature request templates

## 🎯 Quick Links

### Getting Started
1. Read [copilot-instructions.md](copilot-instructions.md) for architecture overview
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks
3. Follow [code-style.md](code-style.md) for coding standards

### Contributing
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Follow the development workflow
3. Submit PRs with proper format

## 🤖 For GitHub Copilot

When working on this project, Copilot should:

1. **Understand the architecture**:
   - Two-stage LLM (Architect + Actor)
   - Meta-prompt system
   - Monolithic Vercel deployment

2. **Follow conventions**:
   - Use `backend.` prefix for imports
   - Run from project root
   - Use design system classes
   - Follow error handling patterns

3. **Reference documentation**:
   - Check `copilot-instructions.md` for architecture
   - Use `QUICK_REFERENCE.md` for snippets
   - Follow `code-style.md` for patterns

## 📖 Additional Resources

- [Main README](../README.md) - Project overview
- [PRD](../docs/prd.md) - Product requirements
- [Meta-Prompt Guide](../docs/meta_prompt.md) - LLM architecture
- [Example Datasets](../docs/example_dataset.md) - Dataset templates
- [Deployment Guide](../docs/vercel_deployment.md) - Vercel setup

## 🔄 Keeping Documentation Updated

When making significant changes:

1. Update relevant `.github` documentation
2. Update main README if needed
3. Add examples to QUICK_REFERENCE if useful
4. Update code-style if new patterns emerge

## 📝 Documentation Standards

All documentation should:
- Be clear and concise
- Include code examples
- Show both correct and incorrect usage
- Link to related documentation
- Be kept up-to-date with code changes

## 🆘 Questions?

If documentation is unclear or missing:
1. Open a GitHub Issue
2. Suggest improvements via PR
3. Ask in GitHub Discussions
