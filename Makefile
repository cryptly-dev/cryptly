.PHONY: backend frontend dev help clean install local

# Default target
help:
	@echo "Available commands:"
	@echo "  backend    - Run backend development server"
	@echo "  frontend   - Run frontend development server"
	@echo "  dev        - Run both backend and frontend concurrently"
	@echo "  local      - Set up and run complete local stack (with MongoDB)"
	@echo "  install    - Install dependencies for both backend and frontend"
	@echo "  clean      - Clean node_modules and build artifacts"
	@echo "  help       - Show this help message"

# Run backend development server
backend:
	@echo "Starting backend development server..."
	cd backend && npm run start:dev

# Run frontend development server  
frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Run both backend and frontend concurrently
dev:
	@echo "Starting both backend and frontend..."
	@trap 'kill %1; kill %2' EXIT; \
	make backend & make frontend & \
	wait

# Install dependencies for both projects
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

# Clean build artifacts and node_modules
clean:
	@echo "Cleaning backend..."
	cd backend && rm -rf node_modules dist
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules dist

# Set up and run complete local stack
local:
	@echo "Setting up local development environment..."
	@make install
	@echo "Setting up environment files..."
	@cp backend/.env.example backend/.env
	@echo "Created backend/.env from backend/.env.example"
	@cp frontend/.env.example frontend/.env
	@echo "Created frontend/.env from frontend/.env.example"
	@echo "Starting MongoDB container..."
	@docker ps --filter "name=cryptly-mongo" --format '{{.Names}}' | grep -q cryptly-mongo && \
		echo "MongoDB container already running" || \
		(docker run -d --name cryptly-mongo -p 2137:27017 mongo:8 && echo "Started MongoDB 8 on port 2137")
	@echo "Starting backend and frontend..."
	@trap 'kill %1; kill %2' EXIT; \
	make backend & make frontend & \
	wait
