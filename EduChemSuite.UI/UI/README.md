# EduChemSuite UI

Angular 21 frontend for the EduChemSuite chemistry education platform.

## Development

```bash
npm install
npm start        # Dev server at http://localhost:4200 (proxies API to localhost:5000)
npm test         # Karma/Jasmine unit tests
npm run build    # Production build (output: dist/ui/)
```

## Tech Stack

- **Angular 21** with standalone components (no NgModules)
- **ng-zorro-antd 21** UI library with custom theme (`theme.less`)
- **molecule-builder** library for chemical structure drawing

## Project Layout

```
src/app/
  _components/     # Shared components (AlertComponent, SearchFilter, etc.)
  _helpers/        # Guards (AuthGuard), interceptors (jwtInterceptor), utilities
  _models/         # TypeScript interfaces matching API DTOs
  _services/       # ApiService (centralized HTTP), AuthService, StorageService, AlertService
  pages/
    account/       # Login, register, confirm-email, profile
    questions/     # Question management with batch add-to-quiz
    exams/         # Exam CRUD, question assignment
    student-exams/ # Take exam, view results
    data-management/ # CSV import/export
    welcome/       # Landing page
```

## Key Patterns

- **Lazy-loaded routes** defined in `app.routes.ts`
- **ApiService** (`_services/api.service.ts`) -- all HTTP calls go through here, targeting `environment.apiUrl`
- **JWT interceptor** (`_helpers/jwt.interceptor.ts`) -- attaches Bearer token, handles 401 refresh
- **AuthGuard** -- redirects unauthenticated users to `/account/login`
- Underscore-prefixed directories (`_components/`, `_services/`, etc.) are shared across pages

## Documentation

User guides are available in the in-app Knowledge Base at `/knowledge-base`.
