# Contributing Guide

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/tubes-pdb.git
   cd tubes-pdb
   ```
3. **Set up development environment**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Copy environment template
   cp .env.example .env
   # Fill in your API keys
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow the [Code Style Guide](.github/code-style.md)
- Write clear, descriptive commit messages
- Test your changes locally

### 3. Test Your Changes

**Backend:**
```bash
python backend/app.py
# Test endpoints with curl or Postman
```

**Frontend:**
```bash
cd frontend
npm run dev
# Test in browser at http://localhost:5173
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug in chat"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title Format
```
<type>: <description>

Examples:
feat: add dataset filtering in lecturer dashboard
fix: resolve CORS issue in production
docs: update API documentation
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guide
- [ ] Tested locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Code Review Process

1. **Automated Checks**: Ensure all checks pass
2. **Peer Review**: Wait for at least one approval
3. **Address Feedback**: Make requested changes
4. **Merge**: Maintainer will merge when ready

## Areas for Contribution

### Backend
- [ ] Add unit tests for services
- [ ] Implement rate limiting
- [ ] Add logging system
- [ ] Optimize database queries
- [ ] Add caching layer

### Frontend
- [ ] Add loading skeletons
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Implement dark mode
- [ ] Add accessibility features

### Documentation
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Create video tutorials
- [ ] Translate documentation
- [ ] Add more example datasets

### Features
- [ ] Export grades to CSV
- [ ] Assignment deadlines
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Multiple datasets per assignment

## Bug Reports

Use GitHub Issues with this template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox]
- Python version: [e.g. 3.9]
- Node version: [e.g. 18.0]

**Additional context**
Any other context about the problem.
```

## Feature Requests

Use GitHub Issues with this template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

## Questions?

- Check [README.md](../README.md)
- Review [copilot-instructions.md](.github/copilot-instructions.md)
- Open a GitHub Discussion
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
