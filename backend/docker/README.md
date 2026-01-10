# Aeon Docker Setup

This directory contains Docker configuration for containerizing the Aeon application.

## Quick Start

### Development Mode (Infrastructure Only)

Run only the database and support services for local development:

```bash
cd backend/docker
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching/sessions
- **pgAdmin** (port 5050) - Database management UI
- **Mailhog** (port 8025) - Email testing

**pgAdmin Access:**
- URL: http://localhost:5050
- Email: admin@aeon.local
- Password: admin

**Database Connection:**
- Host: localhost
- Port: 5432
- Database: aeon_dev
- Username: aeon
- Password: aeon_dev

### Production Mode (Full Stack)

Run the complete application stack:

```bash
cd backend/docker

# Create .env file from example
cp .env.example .env

# Edit .env and update secrets (IMPORTANT!)
# - POSTGRES_PASSWORD
# - JWT_SECRET

# Build and start all services
docker-compose up --build -d
```

This starts:
- All infrastructure services (PostgreSQL, Redis)
- **Identity API** (port 7039) - Backend API
- **Frontend** (port 3000) - Next.js application

**Access URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:7039
- API Health Check: http://localhost:7039/health
- API Swagger: http://localhost:7039/swagger (if enabled)

## Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f identity-api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

### Stop and Remove Volumes (WARNING: Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Without Cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Restart a Single Service
```bash
docker-compose restart identity-api
```

### Execute Commands in Container
```bash
# Access database
docker exec -it aeon-postgres psql -U aeon -d aeon_db

# Access Redis CLI
docker exec -it aeon-redis redis-cli

# Access API container shell
docker exec -it aeon-identity-api /bin/bash
```

## File Structure

```
backend/docker/
├── docker-compose.yml          # Production stack
├── docker-compose.dev.yml      # Development infrastructure
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Environment template
└── services/
    └── identity/
        └── Dockerfile          # Identity API container definition
```

## Environment Variables

Key environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| POSTGRES_USER | Database username | aeon |
| POSTGRES_PASSWORD | Database password | *Must set* |
| POSTGRES_DB | Database name | aeon_db |
| JWT_SECRET | JWT signing secret (min 32 chars) | *Must set* |
| JWT_ISSUER | JWT token issuer | aeon-identity |
| JWT_AUDIENCE | JWT token audience | aeon-app |
| NEXT_PUBLIC_API_BASE_URL | API URL for frontend | http://localhost:7039 |

**Security Note:** Always change `POSTGRES_PASSWORD` and `JWT_SECRET` in production!

## Troubleshooting

### Port Already in Use
If you get port binding errors, check what's using the port:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Kill process by PID
taskkill /PID <PID> /F
```

### Container Won't Start
Check logs for errors:
```bash
docker-compose logs identity-api
docker-compose logs frontend
```

### Database Connection Issues
Ensure PostgreSQL is healthy:
```bash
docker ps
# Check STATUS column shows "healthy"
```

### Reset Everything
```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build -d
```

### Frontend Build Fails
Ensure `output: "standalone"` is in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

### API Health Check Failing
Check if the health endpoint is working:
```bash
curl http://localhost:7039/health
```

## Development Workflow

### Option 1: Hybrid (Recommended for Development)
1. Run infrastructure with `docker-compose.dev.yml`
2. Run API and Frontend locally with hot reload
3. Connect to containerized database

```bash
# Start infrastructure
cd backend/docker
docker-compose -f docker-compose.dev.yml up -d

# Run backend (in separate terminal)
cd backend
dotnet run --project src/Services/Identity/Aeon.Identity.Api

# Run frontend (in separate terminal)
cd frontend
npm run dev
```

### Option 2: Full Docker
1. Make code changes
2. Rebuild and restart containers
3. Good for testing production builds

```bash
cd backend/docker
docker-compose up --build -d
```

## Production Deployment

For production:

1. **Update secrets** in `.env`
2. **Configure reverse proxy** (nginx/traefik) for HTTPS
3. **Set up proper logging** and monitoring
4. **Configure backups** for PostgreSQL volumes
5. **Use secrets management** (Docker secrets, Kubernetes secrets)
6. **Review security settings** in Dockerfiles
7. **Set resource limits** in docker-compose.yml

Example production additions:
```yaml
services:
  identity-api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    restart: unless-stopped
```

## Health Checks

All services include health checks:
- **PostgreSQL**: pg_isready
- **Redis**: redis-cli ping
- **Identity API**: HTTP /health endpoint

Monitor with:
```bash
docker-compose ps
```

## Volumes

Persistent data volumes:
- `postgres_data` - Database files
- `redis_data` - Redis persistence

Backup database:
```bash
docker exec aeon-postgres pg_dump -U aeon aeon_db > backup.sql
```

Restore database:
```bash
docker exec -i aeon-postgres psql -U aeon aeon_db < backup.sql
```

## Network

All services communicate on the `aeon-network` bridge network. Services can reach each other using their service names (e.g., `postgres`, `redis`, `identity-api`).

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify health: `docker ps`
3. Review environment variables in `.env`
4. Ensure ports are not in use
5. Check Docker daemon is running
