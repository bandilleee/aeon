# Aeon

Aeon is a full-stack organization management platform with a .NET API backend and a Next.js frontend.

## Tech Stack

- Backend: ASP.NET Core Web API (.NET 10), Entity Framework Core, SQLite, JWT authentication
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Auth/Security: BCrypt password hashing, JWT bearer tokens
- Email: MailKit (Gmail SMTP)

## Repository Structure

- `backend/OrgManager.Api`: ASP.NET Core API project
- `frontend`: Next.js application
- `aeon.sln`: Visual Studio solution for backend

## Prerequisites

- .NET SDK 10.0+
- Node.js 20+
- npm 10+

## Quick Start

### 1) Start the backend API

From the repository root:

```bash
cd backend/OrgManager.Api
dotnet restore
dotnet run
```

Default API URL:

- `http://localhost:5073`

What happens on startup:

- EF Core migrations are applied automatically
- SQLite database (`orgmanager.db`) is created/updated
- Seed users are created if the database is empty

### 2) Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## Environment Configuration

### Frontend environment variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5073
```

Notes:

- Most frontend services default to `http://localhost:5073` when this variable is missing.
- Setting `NEXT_PUBLIC_API_URL` explicitly is recommended for consistency.

### Backend configuration

Backend settings are in `backend/OrgManager.Api/appsettings.json`.

Important keys:

- `JwtSettings:SecretKey`
- `JwtSettings:Issuer`
- `JwtSettings:Audience`
- `FrontendUrl`
- `Email:GmailUser`
- `Email:GmailPassword`

## Default Seed Accounts

If the users table is empty, these accounts are added automatically:

- Admin: `admin@aeon.com` / `Admin@123`
- Member: `member@aeon.com` / `Member@123`

Source: `backend/OrgManager.Api/Data/DbInitializer.cs`

## API Overview

Base URL:

- `http://localhost:5073`

Main route groups:

- `api/auth`: login, access request, password reset, current user, onboarding
- `api/events`: event CRUD + registration/attendees
- `api/tasks`: task CRUD
- `api/taskcomments`: task comments
- `api/members`: member CRUD
- `api/settings`: user settings/profile/notification/password
- `api/admin/users`: admin user management
- `api/admin/events`: admin event moderation and attendee management
- `api/admin/access-requests`: approve/reject access requests
- `api/admin/dashboard`: admin dashboard stats
- `api/admin/audit-logs`: audit log listing
- `api/admin/settings`: system settings and backup/download

## Authentication

- Login endpoint: `POST /api/auth/login`
- API returns a JWT token and user object
- Protected endpoints require `Authorization: Bearer <token>`

## Database and Migrations

The project uses EF Core migrations in:

- `backend/OrgManager.Api/Migrations`

Useful commands:

```bash
cd backend/OrgManager.Api

# Add a migration
dotnet ef migrations add <MigrationName>

# Apply migrations
dotnet ef database update
```

## Running in Visual Studio

- Open `aeon.sln`
- Set startup profile to `http` (default `http://localhost:5073`)
- Run the backend project (`OrgManager.Api`)
- Run frontend separately with `npm run dev`

## Security Notes

- Do not use default seed credentials outside local development.
- Do not commit production secrets in `appsettings.json`.
- Use environment-specific secret management for production.

## Troubleshooting

### Frontend cannot connect to backend

- Ensure backend is running on `http://localhost:5073`
- Verify `frontend/.env.local` has the correct `NEXT_PUBLIC_API_URL`
- Restart `npm run dev` after changing env variables

### Token/auth issues

- Confirm JWT settings (`SecretKey`, `Issuer`, `Audience`) are present
- Check frontend is sending `Authorization: Bearer <token>`

### Email not sending

- Verify Gmail credentials in backend settings
- Ensure SMTP/app-password configuration is valid

## License

No license file is currently defined in this repository.
