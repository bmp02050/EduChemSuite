# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduChemSuite is a chemistry education platform with three components: a .NET 8.0 REST API, an Angular 18 frontend, and a Python Flask ML service (stub).

## Build & Run Commands

### API (EduChemSuite.API)
```bash
# Build
dotnet build EduChemSuite.API/EduChemSuite.API.sln

# Run (starts on localhost:5000)
dotnet run --project EduChemSuite.API/EduChemSuite.API

# Add EF Core migration
dotnet ef migrations add <MigrationName> --project EduChemSuite.API/EduChemSuite.API

# Apply migrations (also auto-applied on startup)
dotnet ef database update --project EduChemSuite.API/EduChemSuite.API
```

### UI (EduChemSuite.UI)
```bash
cd EduChemSuite.UI/UI
npm install
npm start        # Dev server (proxies to API at localhost:5000)
npm test         # Karma/Jasmine tests
npm run build    # Production build
```

### ML (EduChemSuite.ML)
```bash
cd EduChemSuite.ML
python app.py    # Flask dev server (currently a stub)
```

## Architecture

### API Layer Pattern: Controller → Service → Repository (Dao)

The API is being refactored from a two-tier (Controller → Service with direct DB access) to a three-tier pattern:

- **Controllers** (`Controllers/`) — Handle HTTP, authorization, map between Models and delegate to Services. Routes follow `api/[controller]`. Use `[Authorize(Policy = "...")]` for role-based access.
- **Services** (`Services/`) — Business logic layer. Accept and return **Model** DTOs. Use AutoMapper to convert between Entities and Models. Interfaces and implementations live in the same file (e.g., `IDistrictService.cs` contains both `IDistrictService` and `DistrictService`).
- **Repositories** (`Dao/`) — Data access layer. Accept and return **Entities**. Contain EF Core queries with Include/ThenInclude for eager loading. Same file pattern as services. Repositories extend `BaseService<T>` for generic CRUD and override methods with `new` keyword when custom logic is needed.

**In-progress refactoring**: Some services still access `Context` directly (old pattern). New code should use the Repository (Dao) pattern. `IBaseService<T>` provides generic `GetById`, `Create`, `Update` via reflection-based ID lookup.

### Entity/Model Separation

- **Entities** (`Entities/`) — EF Core database models. All extend `BaseEntity` (Id, CreatedAt, UpdatedAt, IsActive). IDs are `Guid`, auto-generated.
- **Models** (`Models/`) — API DTOs. All extend `BaseModel`. Mapped to/from entities via `AutoMapperProfile.cs`.
- **AutoMapper** — Bidirectional maps defined in `AutoMapperProfile.cs`. User mapping ignores sensitive fields (PasswordHash, PasswordSalt).

### Database

- **PostgreSQL** via Npgsql. Connection string key: `ConnectionStrings:dev` in appsettings.
- **Context.cs** — DbContext with automatic `CreatedAt`/`UpdatedAt` timestamping in overridden `SaveChanges`/`SaveChangesAsync`.
- **Many-to-many relationships** use explicit join entities (DistrictSchools, UserDistrict, UserSchool) with composite keys configured in `OnModelCreating`.
- Migrations auto-apply on startup via `db.Database.Migrate()`.

### Authentication & Authorization

- JWT Bearer authentication with custom HMACSHA512 password hashing (not ASP.NET Identity).
- Token refresh flow: `AuthController` → `ITokenService` → `ITokenRepository`.
- Registration uses email-based invite tokens (`RegistrationInviteToken`).
- Authorization policies: `IsStaff`, `IsAdmin`, `IsStudent`, `IsAdminStaff`, `IsAdminOrStaff`, `IsElevatedUser`.
- JWT config sourced from `Jwt` section in appsettings.

### Angular Frontend

- **Angular 18** with standalone components (no NgModules), lazy-loaded routes.
- **ng-zorro-antd** UI component library with a custom theme (`theme.less`).
- Underscore-prefixed shared directories: `_components/`, `_helpers/`, `_models/`, `_services/`.
- `ApiService` — Centralized HTTP client targeting `environment.apiUrl`.
- `AuthService` / `StorageService` — Handle login state and session storage.
- `jwtInterceptorInterceptor` — Functional HTTP interceptor that attaches Bearer tokens and handles 401 refresh flow.
- `AuthGuard` — Redirects unauthenticated users to `/account/login`.

### DI Registration

All services and repositories are registered as `Transient` in `Program.cs`. The `Jwt` config is registered via `Configure<Jwt>()`.

### Middleware

`RequestMiddleware` blocks suspicious requests (CGI probing, CONNECT method) before they reach controllers.

### Key Relationships

The domain centers on: **Districts** contain **Schools**; **Users** belong to Schools and Districts; **Users** create **Questions** (versioned via `Version` field, soft-deleted via `IsActive`); **Exams** contain **ExamQuestions** linking to **Questions**; **ExamResponses** track student **Answers**; **Grades** link Users to Exams.

## Conventions

- Async/await throughout all layers
- Interface + implementation in the same file (e.g., `IDistrictService.cs`)
- Primary constructor injection (C# 12 syntax): `public class Foo(IDep dep) : Base`
- Soft deletes via `IsActive` flag on `BaseEntity`
- CORS configured for `http://localhost:4200` (Angular dev server)
- Serilog for structured logging
