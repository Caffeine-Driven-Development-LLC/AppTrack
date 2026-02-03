# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm start            # Start development environment (Electron with hot reload)
npm run build        # Build production app (outputs to /out)
npm run package      # Package the app
npm run make         # Create distributable installers
```

## Testing

Tests are located in `src/js/` and use Jest:

```bash
npm test                    # Run all tests
npm run testWithCoverage    # Run tests with coverage report

# Run a single test file
npm --prefix ./src/js test -- path/to/test.test.js
```

## Architecture

This is an Electron desktop app (React frontend) for tracking job applications. All data is stored locally in SQLite.

### Process Structure

- **Main Process** (`src/js/main/`): Backend logic, database access, IPC handlers
  - `main.js` - Electron app entry point
  - `database-client.js` - SQLite connection and migrations
  - `service/` - Business logic layer
  - `persistence/` - SQL queries and data access
  - `ipc-actions/` - IPC handler registration

- **Renderer Process** (`src/js/render/`): React UI
  - `main-window/` - App shell, routing, pages
  - `components/` - Reusable React components
  - `preload/` - Exposes IPC APIs to renderer (`window.applicationApi`, `window.companyApi`, etc.)

- **Shared** (`src/js/shared/`): IPC channel name constants shared between main and renderer

### IPC Communication Pattern

Renderer ↔ Main communication uses named channels defined in `src/js/shared/*-ipc-channels.js`. Preload scripts expose typed APIs (e.g., `window.applicationApi.createApplication()`). Services in main process handle the business logic and call persistence layer for database operations.

### Database

SQLite database with migrations in `src/sql/dbMigrations/`. Migrations auto-run on app startup. Key tables:
- `applications`, `companies`, `events` - Core data
- `applicationStates`, `applicationFlow` - Configurable state machine for application progress
- `sankeyNodes`, `sankeyLinks` - Visualization configuration

Uses soft deletes (`isDeleted` flag) throughout.

### UI Framework

React 18 with MUI (Material-UI) v5. Theme switching (light/dark/system) via Electron's `nativeTheme`.
