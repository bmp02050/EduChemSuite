# EduChemSuite

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](LICENSE.md)
[![Build Status](https://github.com/bmp02050/educhemsuite/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/bmp02050/educhemsuite/actions/workflows/build-deploy.yml)

A chemistry education platform for creating, assigning, and grading exams, including molecule diagram questions with a built-in structure builder.

## Architecture

| Component | Stack | Port |
|-----------|-------|------|
| **API** | .NET 9.0, EF Core, PostgreSQL | `localhost:5000` (dev) / `8080` (prod) |
| **UI** | Angular 21, ng-zorro-antd | `localhost:4200` (dev) / `80` (prod) |
| **ML** | Python Flask (non-functional stub) | - |

The API follows a **Controller > Service > Repository** pattern with AutoMapper for entity/model separation. The frontend uses standalone components with lazy-loaded routes.

## Quick Start (Local Development)

### Prerequisites

- .NET 9.0 SDK
- Node.js 18+
- PostgreSQL (or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_DB=educhemsuite -e POSTGRES_PASSWORD=postgres postgres:17-alpine`)

### API

```bash
dotnet build EduChemSuite.API/EduChemSuite.API.sln
dotnet run --project EduChemSuite.API/EduChemSuite.API
```

Configure `ConnectionStrings:dev` and `Jwt` settings in `EduChemSuite.API/EduChemSuite.API/appsettings.Development.json`. Migrations auto-apply on startup.

### UI

```bash
cd EduChemSuite.UI/UI
npm install
npm start
```

The dev server proxies API requests to `localhost:5000`.

### EF Core Migrations

```bash
# Add a new migration
dotnet ef migrations add <Name> --project EduChemSuite.API/EduChemSuite.API

# Apply manually (also happens on startup)
dotnet ef database update --project EduChemSuite.API/EduChemSuite.API
```

## Production Deployment

Docker Compose with three services (postgres, api, ui). Images are published to GHCR.

```bash
# Create .env with required variables (see below), then:
docker compose up -d
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `JWT_ISSUER` | JWT issuer URL |
| `JWT_AUDIENCE` | JWT audience URL |
| `JWT_KEY` | JWT signing key (HMACSHA512) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `EMAIL_SMTP_SERVER` | SMTP server (default: `smtp.gmail.com`) |
| `EMAIL_SMTP_PORT` | SMTP port (default: `587`) |
| `EMAIL_SMTP_USER` | SMTP username |
| `EMAIL_SMTP_PASSWORD` | SMTP password |

## Self-Hosting

EduChemSuite is designed for self-hosting. Official Docker images are published to GHCR at `ghcr.io/bmp02050/educhemsuite/` and pulled by the deployment workflow.

To self-host:
1. Fork this repository or use the images directly
2. If using your own images, update the image references in `docker-compose.yml`
3. Follow the **Production Deployment** section above
4. Deploy the Caddy reverse proxy using the template in `infrastructure/caddy-proxy/Caddyfile.example`

## CI/CD

GitHub Actions (`.github/workflows/build-deploy.yml`): push to `master` builds Docker images, pushes to GHCR, then SSH-deploys via `docker compose pull && up -d`.

## Key Features

- **Exam Management** -- Create exams with multiple-choice and molecule diagram questions
- **Molecule Builder** -- Interactive chemical structure drawing tool for diagram questions
- **Background Grading** -- Hangfire jobs with SignalR real-time grade notifications
- **Data Import/Export** -- CSV import and export for users, schools, districts, questions, exams, grades
- **Search & Filter** -- Paginated search across all entities with dynamic filters
- **In-App Messaging** -- Real-time messaging via SignalR
- **Role-Based Access** -- Admin, AdminStaff, Staff, Student roles with district/school data scoping
- **Invite-Based Registration** -- Email invite tokens for controlled user onboarding
- **Dark Mode** -- User-togglable dark theme with automatic preference persistence

## Documentation

User guides for teachers, students, and administrators are available in the in-app Knowledge Base (accessible via the sidebar or at `/knowledge-base`).

## Project Structure

```
EduChemSuite.API/
  EduChemSuite.API/
    Controllers/       # HTTP endpoints
    Services/          # Business logic (interface + impl in same file)
    Dao/               # Data access / repositories
    Entities/          # EF Core models (extend BaseEntity)
    Models/            # API DTOs (extend BaseModel)
    Helpers/           # AutoMapper, CSV maps, utilities
    Hubs/              # SignalR hubs
    Migrations/        # EF Core migrations

EduChemSuite.UI/
  UI/src/app/
    _components/       # Shared components
    _helpers/          # Interceptors, guards, utilities
    _models/           # TypeScript interfaces
    _services/         # ApiService, AuthService, etc.
    pages/             # Feature pages (lazy-loaded routes)
```

## Testing

```bash
# API
dotnet build EduChemSuite.API/EduChemSuite.API.sln

# UI
cd EduChemSuite.UI/UI
npm test         # Unit tests (Karma/Jasmine)
npm run build    # Production build check
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to report issues, submit pull requests, and our code style conventions.

## License

EduChemSuite is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0). See [LICENSE.md](LICENSE.md) for full details.

When you modify and deploy EduChemSuite, you must offer users the ability to access the modified source code. For more information, see the [CONTRIBUTING.md](CONTRIBUTING.md#license) guide.
