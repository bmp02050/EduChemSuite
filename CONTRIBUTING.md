# Contributing to EduChemSuite

Thank you for your interest in contributing to EduChemSuite! This document provides guidelines for contributing code, reporting issues, and submitting pull requests.

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+
- PostgreSQL 17+
- Docker and Docker Compose (for local development)

### Local Development Setup

Refer to the [README](README.md#quick-start-local-development) for detailed setup instructions.

## Reporting Issues

### Bug Reports
1. Check if the issue has already been reported
2. Use the title to clearly describe the problem
3. Provide steps to reproduce the bug
4. Include expected vs. actual behavior
5. Mention your environment (OS, .NET/Node version, etc.)

### Feature Requests
1. Describe the use case and problem it solves
2. Explain your proposed solution
3. Note any trade-offs or alternatives considered

## Submitting Pull Requests

1. **Fork and branch**: Create a feature branch from `master`
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**: Keep commits focused and descriptive

3. **Test locally**:
   - API: `dotnet build` and run the test suite
   - UI: `npm test` and verify the build doesn't have errors
   - Ensure no breaking changes to public APIs

4. **Push and create a PR**: Push to your fork and open a pull request against `master`
   - Provide a clear description of what the PR does
   - Reference any related issues (#123)
   - Ensure CI/CD checks pass

## Code Style & Conventions

### General
- Use **async/await** throughout all layers (Controllers, Services, Repositories)
- Keep methods focused and testable
- Use meaningful variable and function names

### .NET (C#)
- Use **primary constructor injection** (C# 12 syntax):
  ```csharp
  public class UserService(IUserRepository userRepo) : IUserService
  {
      // implementation
  }
  ```
- **Interface + implementation in the same file** (e.g., `IUserService.cs` contains both)
- Use **async Task/Task<T>** for all async methods
- Follow the **Controller → Service → Repository** pattern:
  - Controllers: HTTP handling and authorization
  - Services: Business logic (accept/return Models/DTOs)
  - Repositories: Data access (accept/return Entities)

### Angular/TypeScript
- Use **standalone components** (no NgModules)
- Prefix shared directories with underscore: `_components/`, `_services/`, etc.
- Use the centralized `ApiService` for all HTTP calls
- Follow Angular style guide for naming (camelCase for properties, PascalCase for classes)

### Database
- Use **soft deletes** via the `IsActive` flag on entities
- All entities extend `BaseEntity` (provides Id, CreatedAt, UpdatedAt, IsActive)
- Use **EF Core migrations** for schema changes:
  ```bash
  dotnet ef migrations add DescriptiveName --project EduChemSuite.API/EduChemSuite.API
  ```

## Important Constraints

⚠️ **Do NOT upgrade AutoMapper past v12.x** — newer versions require a commercial license.

⚠️ **Do NOT change Docker networking to `host.docker.internal`** — the application uses Docker DNS names (`postgres`, `api`, `ui`, `seq`) on the `educhemsuite` network.

## License

All contributions are made under the **GNU Affero General Public License v3.0** (AGPL-3.0). By submitting a pull request, you agree that your contributions will be licensed under this license. See [LICENSE.md](LICENSE.md) for full details.

## Questions?

If you have questions or need clarification, feel free to open a discussion or reach out via the issue tracker.

Happy coding!
