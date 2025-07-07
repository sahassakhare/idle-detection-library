# Contributing to Idle Detection Library

Thank you for your interest in contributing to the Idle Detection Library! We welcome contributions from the community and are grateful for any help you can provide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat everyone with respect and create a welcoming environment for all contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git**
- **Angular CLI** 18+ (for Angular development)

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug reports and fixes**
- ✨ **New features and enhancements**
- 📚 **Documentation improvements**
- 🧪 **Test coverage improvements**
- 🎨 **UI/UX improvements**
- 🔧 **Build and tooling improvements**
- 🌐 **Internationalization**

## Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/your-username/idle-detection-library.git
   cd idle-detection-library
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Bootstrap Packages**
   ```bash
   npm run bootstrap
   ```

4. **Build the Library**
   ```bash
   npm run build
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

6. **Start Example Application**
   ```bash
   npm run start:example
   ```

### Project Structure

```
idle-detection-library/
├── packages/
│   └── angular-oauth-integration/     # Main Angular library
│       ├── src/                       # Library source code
│       ├── example/                   # Example application
│       ├── styles/                    # Pre-built themes
│       └── docs/                      # Package documentation
├── docs/                              # Global documentation
├── .github/                           # GitHub templates and workflows
├── README.md                          # Main project README
├── CONTRIBUTING.md                    # This file
├── LICENSE                            # License file
└── package.json                       # Root package configuration
```

## Making Changes

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### Branch Naming Conventions

- **Features**: `feature/feature-name`
- **Bug fixes**: `fix/issue-number-description`
- **Documentation**: `docs/topic-name`
- **Refactoring**: `refactor/component-name`
- **Performance**: `perf/optimization-description`

### 2. Make Your Changes

- Write clear, concise code that follows our coding standards
- Add tests for new functionality
- Update documentation as needed
- Ensure your changes don't break existing functionality

### 3. Commit Your Changes

We use conventional commits for clear commit messages:

```bash
git add .
git commit -m "feat: add new idle timeout configuration option"
```

#### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(auth): add role-based timeout configuration
fix(dialog): resolve styling conflict with Bootstrap
docs(readme): update installation instructions
test(service): add unit tests for idle detection
```

## Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to the [repository on GitHub](https://github.com/your-username/idle-detection-library)
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if applicable)

### 3. Pull Request Guidelines

- **Title**: Use clear, descriptive titles
- **Description**: Explain what you changed and why
- **Link Issues**: Reference related issues with `Fixes #123`
- **Tests**: Ensure all tests pass
- **Documentation**: Update docs for new features
- **Breaking Changes**: Clearly mark any breaking changes

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Enable strict mode
- Provide proper type annotations
- Use interfaces for object types
- Prefer `const` assertions where appropriate

### Angular

- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Use **standalone components** for Angular 18+
- Prefer **signals** for reactive state
- Use **inject()** function over constructor injection
- Implement proper **OnPush** change detection

### Code Style

We use **Prettier** and **ESLint** for code formatting:

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### CSS/SCSS

- Use **CSS custom properties** for theming
- Follow **BEM** methodology for class naming
- Ensure **accessibility** (proper contrast, focus indicators)
- Support **dark mode** where applicable
- Write **responsive** styles

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Aim for **80%+ code coverage**
- Use **Jest** for testing framework
- Mock external dependencies
- Test both success and error scenarios

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```typescript
describe('IdleOAuthService', () => {
  let service: IdleOAuthService;
  
  beforeEach(() => {
    // Setup
  });
  
  describe('startMonitoring', () => {
    it('should start monitoring when called', () => {
      // Test implementation
    });
    
    it('should handle errors gracefully', () => {
      // Error scenario test
    });
  });
});
```

### E2E Tests

- Write integration tests for critical user flows
- Use Angular's testing utilities
- Test cross-browser compatibility
- Verify accessibility compliance

## Documentation

### Code Documentation

- Use **JSDoc** comments for public APIs
- Document complex algorithms
- Provide usage examples
- Keep comments up-to-date

```typescript
/**
 * Configures idle timeout settings for the current user session.
 * 
 * @param config - The idle configuration options
 * @param config.idleTimeout - Time in milliseconds before user is considered idle
 * @param config.warningTimeout - Time in milliseconds for warning period
 * @returns Promise that resolves when configuration is applied
 * 
 * @example
 * ```typescript
 * await service.updateConfig({
 *   idleTimeout: 15 * 60 * 1000,    // 15 minutes
 *   warningTimeout: 2 * 60 * 1000   // 2 minutes
 * });
 * ```
 */
updateConfig(config: IdleConfig): Promise<void>
```

### README Updates

- Update relevant README files
- Add examples for new features
- Include migration guides for breaking changes
- Update API documentation

### Changelog

We maintain a changelog following [Keep a Changelog](https://keepachangelog.com/):

- Document all notable changes
- Group changes by type (Added, Changed, Fixed, etc.)
- Include version numbers and dates
- Reference issue/PR numbers

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes (backward compatible)

### Release Steps

1. **Update Version**
   ```bash
   npm run version
   ```

2. **Update Changelog**
   - Document all changes since last release
   - Include migration notes for breaking changes

3. **Create Release PR**
   - Include version bump and changelog updates
   - Get approval from maintainers

4. **Publish Release**
   ```bash
   npm run publish
   ```

## Getting Help

### Community

- 💬 **GitHub Discussions**: For questions and general discussion
- 🐛 **GitHub Issues**: For bug reports and feature requests
- 📧 **Email**: support@idle-detection-library.com

### Maintainers

Current maintainers:

- @maintainer1 - Lead maintainer
- @maintainer2 - Angular specialist
- @maintainer3 - Documentation lead

### Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Recognition

Contributors will be recognized in:

- 📝 **CONTRIBUTORS.md** file
- 📦 **Package.json** contributors field
- 🏆 **GitHub contributors graph**
- 📰 **Release notes** acknowledgments

Thank you for contributing to the Idle Detection Library! Your efforts help make this project better for everyone. 🎉