# Secretlify

A secure, collaborative secrets management platform with end-to-end encryption.

## Quick Start

```bash
# Set up and run the entire local stack
make local
```

This command will:

- Install all dependencies
- Set up environment files
- Start MongoDB (Docker)
- Launch backend (port 3000) and frontend (port 5173)

## Development

### Individual Commands

```bash
make install     # Install dependencies
make backend     # Run backend only
make frontend    # Run frontend only
make dev         # Run both backend and frontend
make clean       # Clean node_modules and build artifacts
```

### Local Authentication

When running locally, authentication is simplified:

- Just enter any email address to log in
- No OAuth setup required for development

## Tech Stack

**Backend:**

- NestJS
- MongoDB
- JWT Authentication
- OAuth (Google, GitHub)

**Frontend:**

- React + TypeScript
- TanStack Router
- Kea (State Management)
- Vite

## Architecture

- **End-to-end encryption** for secrets
- **Project-based** secrets organization
- **Team collaboration** with invitations
- **Version history** for secrets
- **GitHub integration** for secrets sync

## Requirements

- Node.js 18+
- Docker (for MongoDB)
- pnpm (frontend)
- npm (backend)

## Environment Variables

Environment variables are managed via `.env.example` files in both `backend/` and `frontend/` directories. When running `make local`, these are automatically copied to `.env` files with local development defaults.
