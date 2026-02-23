# Aeon Backend Architecture

A comprehensive guide to the backend architecture, technical design, and implementation strategy for the Aeon Community Management Platform.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decision](#architecture-decision)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Authentication & Security](#authentication--security)
8. [CQRS Pattern](#cqrs-pattern)
9. [Domain-Driven Design](#domain-driven-design)
10. [Event-Driven Architecture](#event-driven-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Development Guidelines](#development-guidelines)
14. [Monitoring & Logging](#monitoring--logging)

---

## Project Overview

### Purpose & Vision

**Aeon** is an **Enterprise Community Management Platform** designed for team collaboration, event management, and access control. It combines authentication, authorization, user management, and community features into a cohesive system.

### Core Features

#### Authentication & Security
- User registration with email verification
- JWT-based authentication with refresh tokens
- Multi-factor authentication (TOTP + Backup codes)
- Password management with BCrypt hashing
- Session management across devices
- Role-based access control (RBAC)

#### User Management
- User profiles with roles (Admin, Member, Guest)
- Access request workflows with approval system
- Audit logging for compliance
- User deactivation and account management

#### Community Management
- Event management and approvals
- Team/group organization
- User invitations and join requests
- Admin dashboard with analytics

#### Frontend Architecture
- Next.js 15+ (App Router)
- React 19 with TypeScript
- Dark-themed SaaS UI (Tailwind CSS)
- Context-based state management
- Role-based page routing

---

## Architecture Decision

### Why We're Rebuilding

The existing backend had a solid foundation but lacked complete implementation:

| Issue | Impact | Status |
|-------|--------|--------|
| Incomplete API endpoints | No actual business logic | ❌ Critical |
| Missing domain models | Empty domain layer | ❌ Critical |
| No application commands/queries | Scaffolding only | ❌ Critical |
| Bare infrastructure setup | Only DbContext, no repositories | ⚠️ High |
| No event bus/pub-sub | Difficult to scale notifications | ⚠️ High |
| Missing validation layer | No business rules | ⚠️ Medium |
| No response standardization | API format undefined | ⚠️ Medium |

### Selected Pattern: **Domain-Driven Design (DDD) + CQRS + Clean Architecture**

This approach ensures:
- ✅ **Scalability** - Event-driven, microservices-ready
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Security** - OAuth2-ready, JWT, MFA, audit logging
- ✅ **Testability** - CQRS, dependency injection, mocking-friendly
- ✅ **Production-Ready** - .NET LTS, monitoring, error handling

---

## Tech Stack

### Core Framework
```
Framework:           .NET 9 LTS (production stable)
Language:            C# 12+
Architecture:        DDD + CQRS + Clean Architecture
```

### Data Layer
```
Database:            PostgreSQL 15+
ORM:                 Entity Framework Core 9
Migrations:          Code-First with EF migrations
Caching:             Redis
```

### Business Logic
```
CQRS:                MediatR
Validation:          FluentValidation
Mapping:             AutoMapper
Event Bus:           MassTransit (RabbitMQ/Service Bus)
Background Jobs:     Hangfire
```

### Infrastructure
```
Logging:             Serilog + ELK Stack
Monitoring:          Prometheus + Grafana
API Documentation:   OpenAPI 3.1 + SwaggerUI
Containerization:    Docker
Orchestration:       Docker Compose (Dev) / Kubernetes (Prod)
```

### Testing
```
Unit Testing:        xUnit
Mocking:             NSubstitute
Assertions:          FluentAssertions
Integration:         TestContainers
```

### Security
```
Authentication:      JWT + OAuth2.0
MFA:                 TOTP (Google Authenticator)
Password Hashing:    BCrypt
Refresh Tokens:      Rotating tokens with device binding
```

---

## Folder Structure

```
backend/
├── src/
│   ├── BuildingBlocks/
│   │   ├── Aeon.BuildingBlocks.CQRS/
│   │   │   ├── Commands/
│   │   │   │   └── ICommand.cs
│   │   │   ├── Queries/
│   │   │   │   └── IQuery.cs
│   │   │   ├── Events/
│   │   │   │   └── IDomainEvent.cs
│   │   │   ├── Behaviors/
│   │   │   │   ├── ValidationBehavior.cs
│   │   │   │   ├── LoggingBehavior.cs
│   │   │   │   └── CachingBehavior.cs
│   │   │   └── ServiceCollectionExtensions.cs
│   │   ├── Aeon.Common.Kernel/
│   │   │   ├── Exceptions/
│   │   │   │   ├── DomainException.cs
│   │   │   │   ├── ValidationException.cs
│   │   │   │   └── NotFoundException.cs
│   │   │   ├── Guards/
│   │   │   │   └── Guard.cs
│   │   │   ├── Extensions/
│   │   │   └── Constants/
│   │   ├── Aeon.EventBus/
│   │   │   ├── Contracts/
│   │   │   ├── Consumers/
│   │   │   └── Publishers/
│   │   └── Aeon.BuildingBlocks.Web/
│   │       ├── Middleware/
│   │       │   ├── ExceptionHandlingMiddleware.cs
│   │       │   ├── RequestLoggingMiddleware.cs
│   │       │   └── RateLimitingMiddleware.cs
│   │       ├── Filters/
│   │       └── Extensions/
│   │
│   ├── Services/
│   │   └── Identity/
│   │       ├── Aeon.Identity.Domain/
│   │       │   ├── Aggregates/
│   │       │   │   ├── User/
│   │       │   │   │   ├── User.cs (AggregateRoot)
│   │       │   │   │   ├── UserId.cs (StrongType)
│   │       │   │   │   ├── Password.cs (ValueObject)
│   │       │   │   │   ├── Email.cs (ValueObject)
│   │       │   │   │   ├── UserRole.cs
│   │       │   │   │   ├── UserStatus.cs
│   │       │   │   │   └── Events/
│   │       │   │   │       ├── UserRegisteredEvent.cs
│   │       │   │   │       ├── UserActivatedEvent.cs
│   │       │   │   │       └── PasswordChangedEvent.cs
│   │       │   │   ├── AccessRequest/
│   │       │   │   │   ├── AccessRequest.cs
│   │       │   │   │   ├── AccessRequestId.cs
│   │       │   │   │   └── Events/
│   │       │   │   │       ├── AccessRequestedEvent.cs
│   │       │   │   │       ├── AccessApprovedEvent.cs
│   │       │   │   │       └── AccessRejectedEvent.cs
│   │       │   │   └── Session/
│   │       │   │       ├── Session.cs
│   │       │   │       ├── SessionId.cs
│   │       │   │       └── Events/
│   │       │   │           ├── SessionStartedEvent.cs
│   │       │   │           └── SessionEndedEvent.cs
│   │       │   ├── Repositories/
│   │       │   │   ├── IUserRepository.cs
│   │       │   │   ├── IAccessRequestRepository.cs
│   │       │   │   ├── ISessionRepository.cs
│   │       │   │   └── IUnitOfWork.cs
│   │       │   ├── Specifications/
│   │       │   │   ├── UserByEmailSpecification.cs
│   │       │   │   └── UserWithSessionsSpecification.cs
│   │       │   └── Errors/
│   │       │       └── IdentityErrors.cs
│   │       │
│   │       ├── Aeon.Identity.Application/
│   │       │   ├── Commands/
│   │       │   │   ├── Auth/
│   │       │   │   │   ├── RegisterUserCommand.cs
│   │       │   │   │   ├── RegisterUserCommandHandler.cs
│   │       │   │   │   ├── LoginCommand.cs
│   │       │   │   │   ├── LoginCommandHandler.cs
│   │       │   │   │   ├── RefreshTokenCommand.cs
│   │       │   │   │   └── LogoutCommand.cs
│   │       │   │   ├── Users/
│   │       │   │   │   ├── UpdateUserProfileCommand.cs
│   │       │   │   │   ├── ChangePasswordCommand.cs
│   │       │   │   │   └── DeactivateUserCommand.cs
│   │       │   │   ├── AccessRequests/
│   │       │   │   │   ├── RequestAccessCommand.cs
│   │       │   │   │   ├── ApproveAccessCommand.cs
│   │       │   │   │   └── RejectAccessCommand.cs
│   │       │   │   ├── MultiFactorAuth/
│   │       │   │   │   ├── EnableTotpCommand.cs
│   │       │   │   │   ├── DisableTotpCommand.cs
│   │       │   │   │   ├── VerifyTotpCommand.cs
│   │       │   │   │   └── GenerateBackupCodesCommand.cs
│   │       │   │   └── Sessions/
│   │       │   │       ├── StartSessionCommand.cs
│   │       │   │       └── EndSessionCommand.cs
│   │       │   ├── Queries/
│   │       │   │   ├── Users/
│   │       │   │   │   ├── GetUserByIdQuery.cs
│   │       │   │   │   ├── GetUserByIdQueryHandler.cs
│   │       │   │   │   ├── GetAllUsersQuery.cs
│   │       │   │   │   └── SearchUsersQuery.cs
│   │       │   │   ├── AccessRequests/
│   │       │   │   │   ├── GetAccessRequestByIdQuery.cs
│   │       │   │   │   ├── GetPendingAccessRequestsQuery.cs
│   │       │   │   │   └── GetUserAccessRequestsQuery.cs
│   │       │   │   └── Sessions/
│   │       │   │       ├── GetUserSessionsQuery.cs
│   │       │   │       └── GetActiveSessionsQuery.cs
│   │       │   ├── DTOs/
│   │       │   │   ├── Requests/
│   │       │   │   │   ├── RegisterUserRequest.cs
│   │       │   │   │   ├── LoginRequest.cs
│   │       │   │   │   └── AccessRequestDto.cs
│   │       │   │   └── Responses/
│   │       │   │       ├── UserDTO.cs
│   │       │   │       ├── AuthTokenDTO.cs
│   │       │   │       └── ApiResponse<T>.cs
│   │       │   ├── Validators/
│   │       │   │   ├── RegisterUserCommandValidator.cs
│   │       │   │   ├── ChangePasswordCommandValidator.cs
│   │       │   │   └── AccessRequestValidator.cs
│   │       │   ├── Services/
│   │       │   │   ├── IAuthenticationService.cs
│   │       │   │   ├── ITokenService.cs
│   │       │   │   ├── IPasswordService.cs
│   │       │   │   ├── IMfaService.cs
│   │       │   │   └── IAuditService.cs
│   │       │   ├── Behaviors/
│   │       │   │   ├── ValidationBehavior.cs
│   │       │   │   ├── TransactionBehavior.cs
│   │       │   │   └── AuditingBehavior.cs
│   │       │   ├── Mapper/
│   │       │   │   └── MappingProfile.cs
│   │       │   └── DependencyInjection.cs
│   │       │
│   │       ├── Aeon.Identity.Infrastructure/
│   │       │   ├── Persistence/
│   │       │   │   ├── Context/
│   │       │   │   │   ├── IdentityDbContext.cs
│   │       │   │   │   └── IdentityDbContextSeed.cs
│   │       │   │   ├── Configurations/
│   │       │   │   │   ├── UserConfiguration.cs
│   │       │   │   │   ├── AccessRequestConfiguration.cs
│   │       │   │   │   ├── SessionConfiguration.cs
│   │       │   │   │   └── BackupCodeConfiguration.cs
│   │       │   │   ├── Migrations/
│   │       │   │   │   ├── 20250115000000_InitialCreate.cs
│   │       │   │   │   └── [More migrations...]
│   │       │   │   └── Repositories/
│   │       │   │       ├── UserRepository.cs
│   │       │   │       ├── AccessRequestRepository.cs
│   │       │   │       ├── SessionRepository.cs
│   │       │   │       └── UnitOfWork.cs
│   │       │   ├── Services/
│   │       │   │   ├── Authentication/
│   │       │   │   │   ├── TokenService.cs
│   │       │   │   │   ├── RefreshTokenService.cs
│   │       │   │   │   └── JwtSettings.cs
│   │       │   │   ├── Security/
│   │       │   │   │   ├── PasswordHasher.cs
│   │       │   │   │   └── PasswordValidator.cs
│   │       │   │   ├── MultiFactorAuth/
│   │       │   │   │   ├── TotpService.cs
│   │       │   │   │   ├── BackupCodeGenerator.cs
│   │       │   │   │   └── TotpSettings.cs
│   │       │   │   ├── Audit/
│   │       │   │   │   ├── AuditService.cs
│   │       │   │   │   └── AuditLogger.cs
│   │       │   │   └── Notifications/
│   │       │   │       └── NotificationService.cs
│   │       │   ├── EventConsumers/
│   │       │   │   ├── UserRegisteredEventConsumer.cs
│   │       │   │   └── AccessRequestEventConsumer.cs
│   │       │   ├── Cache/
│   │       │   │   ├── CacheService.cs
│   │       │   │   └── RedisCacheProvider.cs
│   │       │   ├── Background/
│   │       │   │   ├── AccessRequestCleanupJob.cs
│   │       │   │   └── SessionPruningJob.cs
│   │       │   └── DependencyInjection.cs
│   │       │
│   │       ├── Aeon.Identity.Api/
│   │       │   ├── Controllers/
│   │       │   │   ├── AuthController.cs
│   │       │   │   ├── UsersController.cs
│   │       │   │   ├── AccessRequestsController.cs
│   │       │   │   └── SessionsController.cs
│   │       │   ├── Endpoints/
│   │       │   │   ├── Auth/
│   │       │   │   ├── Users/
│   │       │   │   └── Sessions/
│   │       │   ├── Configuration/
│   │       │   │   ├── ApiVersioningConfiguration.cs
│   │       │   │   ├── CorsConfiguration.cs
│   │       │   │   └── SwaggerConfiguration.cs
│   │       │   ├── Filters/
│   │       │   │   └── ApiExceptionFilter.cs
│   │       │   ├── Program.cs
│   │       │   ├── appsettings.json
│   │       │   └── Dockerfile
│   │       │
│   │       ├── Aeon.Identity.Domain.Tests/
│   │       ├── Aeon.Identity.Application.Tests/
│   │       └── Aeon.Identity.Infrastructure.Tests/
│   │
│   └── Shared/
│       └── Aeon.Contracts/
│           └── Shared DTOs for inter-service communication
│
└── docker-compose.yml
```

---

## Database Design

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),
    status SMALLINT NOT NULL DEFAULT 0, -- 0=Pending, 1=Active, 2=Deactivated
    role SMALLINT NOT NULL DEFAULT 1, -- 0=Admin, 1=Member, 2=Guest
    mfa_enabled BOOLEAN DEFAULT FALSE,
    totp_secret VARCHAR(32),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

#### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent VARCHAR(500),
    device_name VARCHAR(100),
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent VARCHAR(500),
    device_name VARCHAR(100),
    browser VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

#### Access Requests Table
```sql
CREATE TABLE access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    requested_role SMALLINT NOT NULL,
    status SMALLINT NOT NULL DEFAULT 0, -- 0=Pending, 1=Approved, 2=Rejected
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status)
);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);
```

---

## API Design

### Response Standardization

All API responses follow a unified envelope pattern:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public PaginationInfo Pagination { get; set; }
    public List<ApiError> Errors { get; set; }
    public string TraceId { get; set; }
    public DateTime Timestamp { get; set; }
}

public class ApiError
{
    public string Code { get; set; }
    public string Message { get; set; }
    public string Field { get; set; } // For validation errors
    public string Details { get; set; }
}
```

### Example Responses

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "pagination": null,
  "errors": null,
  "traceId": "0HN4IRJVP9VJB:00000001",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "pagination": null,
  "errors": [
    {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "An account with this email already exists",
      "field": null,
      "details": null
    }
  ],
  "traceId": "0HN4IRJVP9VJB:00000002",
  "timestamp": "2025-01-15T10:30:05Z"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "data": null,
  "pagination": null,
  "errors": [
    {
      "code": "INVALID_EMAIL_FORMAT",
      "message": "Email address is not valid",
      "field": "email",
      "details": null
    },
    {
      "code": "PASSWORD_TOO_SHORT",
      "message": "Password must be at least 12 characters",
      "field": "password",
      "details": null
    }
  ],
  "traceId": "0HN4IRJVP9VJB:00000003",
  "timestamp": "2025-01-15T10:30:10Z"
}
```

### API Endpoints

#### Authentication Endpoints
```
POST   /api/v1/auth/register              - Register new user
POST   /api/v1/auth/login                 - Login with credentials
POST   /api/v1/auth/refresh-token         - Refresh access token
POST   /api/v1/auth/logout                - Logout from current session
POST   /api/v1/auth/revoke-all            - Revoke all sessions
POST   /api/v1/auth/forgot-password       - Request password reset
POST   /api/v1/auth/reset-password        - Reset password with token
GET    /api/v1/auth/verify-email/:token   - Verify email address
```

#### User Endpoints
```
GET    /api/v1/users/:id                  - Get user by ID
GET    /api/v1/users                      - Get all users (paginated)
GET    /api/v1/users/search               - Search users
GET    /api/v1/users/profile              - Get current user profile
PUT    /api/v1/users/:id                  - Update user profile
PATCH  /api/v1/users/:id/password         - Change password
DELETE /api/v1/users/:id                  - Deactivate user account
```

#### Access Request Endpoints
```
POST   /api/v1/access-requests            - Request access
GET    /api/v1/access-requests            - Get user's access requests
GET    /api/v1/access-requests/pending    - Get pending requests (admin)
PUT    /api/v1/access-requests/:id        - Update request status
POST   /api/v1/access-requests/:id/approve - Approve access request
POST   /api/v1/access-requests/:id/reject  - Reject access request
```

#### Multi-Factor Authentication Endpoints
```
POST   /api/v1/mfa/totp/enable            - Enable TOTP
POST   /api/v1/mfa/totp/verify            - Verify TOTP code
POST   /api/v1/mfa/totp/disable           - Disable TOTP
POST   /api/v1/mfa/backup-codes/generate  - Generate backup codes
GET    /api/v1/mfa/backup-codes           - Get backup codes (require auth)
```

#### Session Endpoints
```
GET    /api/v1/sessions                   - Get user's active sessions
DELETE /api/v1/sessions/:id                - Terminate specific session
POST   /api/v1/sessions/revoke-all        - Terminate all sessions
```

---

## Authentication & Security

### Authentication Flow

```
Client (Frontend)
       │
       ├─►  POST /auth/register
       │    ├─ Create user account
       │    ├─ Send verification email
       │    └─ Return success message
       │
       ├─►  POST /auth/login
       │    ├─ Validate credentials
       │    ├─ Check MFA requirement
       │    ├─ Create session
       │    ├─ Generate JWT (15 min)
       │    ├─ Generate Refresh Token (7 days)
       │    └─ Return tokens + session info
       │
       ├─►  API Requests
       │    ├─ Authorization: Bearer {jwt}
       │    ├─ Validate JWT signature
       │    ├─ Check token expiry
       │    ├─ Extract claims (userId, role)
       │    └─ Continue processing
       │
       ├─►  Token Expired
       │    ├─ POST /auth/refresh-token
       │    ├─ Validate refresh token
       │    ├─ Check device binding
       │    ├─ Generate new JWT
       │    ├─ Rotate refresh token
       │    └─ Return new tokens
       │
       └─►  POST /auth/logout
            ├─ Revoke refresh token
            ├─ Terminate session
            └─ Clear client-side storage
```

### Security Policies

#### Password Policy
- Minimum 12 characters
- Uppercase, lowercase, numbers, symbols required
- No common passwords (HaveIBeenPwned API)
- Not username or email variant
- Password history (last 5 passwords)

#### Email Verification
- JWT-based token, 24-hour expiry
- One-time use only
- Resend available (rate-limited)

#### Multi-Factor Authentication
- TOTP (Time-based One-Time Password)
  - Compatible: Google Authenticator, Microsoft Authenticator, Authy
  - 30-second time window
  - Backup codes (12x 8-character codes)
  - Recovery email option

#### Session Management
- Device fingerprinting
- IP change detection
- Concurrent session limits (configurable)
- Idle timeout (30 minutes)
- Absolute timeout (24 hours)
- Session binding to device

#### Rate Limiting
```
Login attempts:        5 per 15 minutes
Registration:          3 per 24 hours
Password reset:        3 per 24 hours
API requests:          1000 per minute (per user)
Email verification:    3 resends per 24 hours
```

#### Audit Logging
Track all security-relevant actions:
- User registration
- Login/logout
- Password changes
- Role/permission changes
- Access request approval/rejection
- MFA enable/disable
- Session creation/termination
- Admin actions

---

## CQRS Pattern

### Command & Query Separation

**Commands** - Actions that modify state:
```csharp
public class RegisterUserCommand : ICommand<AuthTokenDTO>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
}

public class RegisterUserCommandHandler : ICommandHandler<RegisterUserCommand, AuthTokenDTO>
{
    public async Task<AuthTokenDTO> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate email uniqueness
        // 2. Create User aggregate
        // 3. Raise domain events
        // 4. Save to repository
        // 5. Publish events to event bus
        // 6. Generate JWT token
        // 7. Return DTO
    }
}
```

**Queries** - Read-only operations:
```csharp
public class GetUserByIdQuery : IQuery<UserDTO>
{
    public Guid UserId { get; set; }
}

public class GetUserByIdQueryHandler : IQueryHandler<GetUserByIdQuery, UserDTO>
{
    public async Task<UserDTO> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        // 1. Query read model or database
        // 2. Map to DTO
        // 3. Return data (no state changes)
    }
}
```

### Pipeline Behaviors

**Automatic cross-cutting concerns:**

1. **ValidationBehavior** - Validates command/query before execution
2. **LoggingBehavior** - Logs all command/query executions
3. **CachingBehavior** - Caches query results
4. **TransactionBehavior** - Wraps commands in transactions
5. **AuditingBehavior** - Records audit trail

---

## Domain-Driven Design

### Core Concepts

#### Aggregate Roots
- **User** - User account aggregate
  - Email, Password, Profile, MFA, Sessions
  - Enforces: unique email, password policies
  - Publishes: UserRegistered, PasswordChanged, MfaEnabled events

- **AccessRequest** - Access control aggregate
  - Requester, Status, Reviewer notes
  - Enforces: single request per user
  - Publishes: AccessRequested, AccessApproved, AccessRejected events

- **Session** - User session aggregate
  - Device info, IP address, timestamps
  - Enforces: session validity
  - Publishes: SessionStarted, SessionEnded events

#### Value Objects
- **Email** - Immutable, self-validating email address
- **Password** - Encapsulates password hashing logic
- **UserId** - Strong type for user identity
- **SessionId** - Strong type for session identity
- **AccessRequestId** - Strong type for request identity

#### Domain Events
Domain events capture important business events:
```csharp
public class UserRegisteredEvent : IDomainEvent
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public DateTime OccurredAt { get; set; }
}
```

---

## Event-Driven Architecture

### Event Flow

```
User Action (Register)
       │
       ▼
Command Handler
       │
       ├─ Create User aggregate
       ├─ Raise UserRegisteredEvent
       │
       ▼
Save to Repository
       │
       ├─ Persist aggregate
       ├─ Collect domain events
       │
       ▼
Publish Events to Event Bus
       │
       ├─ Send to RabbitMQ/Service Bus
       │
       ├───────────┬──────────┬─────────┐
       │           │          │         │
       ▼           ▼          ▼         ▼
    Email      Audit Log  Notification  Analytics
   Consumer    Consumer    Consumer     Consumer
       │           │          │         │
       ├─ Send   ├─ Record  ├─ Queue  ├─ Track
       │ email   │ event    │ email   │ /
       │         │          │         │
```

### Event Consumers
Events trigger side effects through dedicated consumers:

```csharp
public class UserRegisteredEventConsumer : IEventConsumer<UserRegisteredEvent>
{
    public async Task Consume(UserRegisteredEvent @event, CancellationToken cancellationToken)
    {
        // 1. Send welcome email
        // 2. Create audit log entry
        // 3. Update search indexes
        // 4. Trigger welcome message
        // 5. Update analytics
    }
}
```

---

## Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Vercel)                      │
│                  Next.js 15 SSR/SSG                      │
└──────────────────────┬──────────────────────────────────┘
                       │ (HTTPS)
        ┌──────────────▼──────────────┐
        │   API Gateway / Nginx       │
        │  [Rate Limiting, CORS]      │
        └──────────────┬──────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    │ ┌────────────┐   │ ┌──────────┐   ┌▼────────────┐
    │ │   Auth     │   │ │  Users   │   │   Events   │
    │ │  Service   │   │ │ Service  │   │  Service   │
    │ │ (Port 5000)│   │ │(Port 5001)   │(Port 5002) │
    │ └────┬───────┘   │ └────┬─────┘   └┬───────────┘
    │      │           │      │           │
    │ ┌────────────────┴──────┴───────────┴────────┐
    │ │     Shared Infrastructure                  │
    │ ├─────────────────────────────────────────────┤
    │ │ ┌──────────────┐  ┌─────────────────────┐  │
    │ │ │ PostgreSQL   │  │  Redis Cache        │  │
    │ │ │ (Main DB)    │  │ (Sessions, Cache)   │  │
    │ │ └──────────────┘  └─────────────────────┘  │
    │ │                                             │
    │ │ ┌─────────────────────────────────────┐   │
    │ │ │  RabbitMQ / Azure Service Bus       │   │
    │ │ │  (Event Bus)                        │   │
    │ │ └─────────────────────────────────────┘   │
    │ └─────────────────────────────────────────────┘
    │
    └──────────────────────────────────────────────

Monitoring Stack:
├─ Prometheus (Metrics collection)
├─ Grafana (Visualization)
├─ Serilog (Structured logging)
├─ ELK Stack (Log aggregation)
└─ Jaeger (Distributed tracing)
```

### Docker Compose Setup (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: aeon
      POSTGRES_PASSWORD: aeon_dev
      POSTGRES_DB: aeon_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./deploy/docker/init-scripts:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"      # AMQP
      - "15672:15672"    # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  seq:
    image: datalust/seq:latest
    environment:
      ACCEPT_EULA: "Y"
    ports:
      - "5341:80"        # Web UI
    volumes:
      - seq_data:/data

  identity-api:
    build:
      context: .
      dockerfile: src/Services/Identity/Aeon.Identity.Api/Dockerfile
    depends_on:
      - postgres
      - redis
      - rabbitmq
      - seq
    environment:
      ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=aeon_db;Username=aeon;Password=aeon_dev;"
      ConnectionStrings__Redis: "redis:6379"
      RabbitMQ__Host: "rabbitmq"
      Serilog__WriteTo__0__Args__serverUrl: "http://seq:80"
    ports:
      - "5000:5000"
    volumes:
      - .:/app

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  seq_data:
```

### Kubernetes Deployment (Production)

Structure:
```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── identity-api/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── ingress.yaml
├── postgres/
│   ├── statefulset.yaml
│   └── pvc.yaml
├── redis/
│   ├── deployment.yaml
│   └── service.yaml
├── rabbitmq/
│   ├── deployment.yaml
│   └── service.yaml
└── monitoring/
    ├── prometheus.yaml
    └── grafana.yaml
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '9.0.x'
      
      - name: Restore dependencies
        run: dotnet restore
      
      - name: Build
        run: dotnet build --no-restore --configuration Release
      
      - name: Run tests
        run: dotnet test --no-build --verbosity normal
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
      
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Deploy to Kubernetes cluster
          # Update Docker images
          # Run database migrations
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Objectives:** Establish project structure and core infrastructure

- [ ] Set up .NET 9 LTS solution structure
- [ ] Create all project files (Domain, Application, Infrastructure, Api)
- [ ] Configure PostgreSQL & EF Core DbContext
- [ ] Create database migrations
- [ ] Implement CQRS interfaces and MediatR setup
- [ ] Set up dependency injection containers
- [ ] Create base repository pattern

**Deliverables:**
- Working project compilation
- Database schema created
- DI container functional

---

### Phase 2: Domain Models (Weeks 3-4)

**Objectives:** Build domain layer with DDD principles

- [ ] Create User aggregate root
- [ ] Create value objects (Email, Password, UserId)
- [ ] Create UserRole and UserStatus enums
- [ ] Implement domain events (UserRegisteredEvent, etc.)
- [ ] Create AccessRequest aggregate
- [ ] Create Session aggregate
- [ ] Define domain errors/exceptions

**Deliverables:**
- Domain models with validation
- Unit tests for aggregates (> 80% coverage)
- Domain events defined

---

### Phase 3: Authentication (Weeks 5-7)

**Objectives:** Implement complete authentication flow

- [ ] User registration command & handler
- [ ] Email verification workflow
- [ ] Login command with credential validation
- [ ] JWT token generation (AccessToken + RefreshToken)
- [ ] Refresh token mechanism
- [ ] Logout and revoke functionality
- [ ] Password reset workflow
- [ ] Session management

**Deliverables:**
- Auth endpoints fully functional
- Integration tests for auth flow
- Token rotation working
- Email verification tested

---

### Phase 4: Multi-Factor Authentication (Weeks 8-9)

**Objectives:** Implement MFA security layer

- [ ] TOTP setup and verification
- [ ] Backup code generation
- [ ] Backup code validation
- [ ] Disable MFA functionality
- [ ] Recovery mechanisms
- [ ] MFA enforcement policies

**Deliverables:**
- MFA endpoints functional
- TOTP generation and verification
- Backup codes working
- Recovery flow tested

---

### Phase 5: Authorization & Access Control (Weeks 10-11)

**Objectives:** Implement RBAC and access request workflow

- [ ] Role-based authorization middleware
- [ ] Permission checking
- [ ] Access request command (RequestAccess)
- [ ] Access request queries
- [ ] Approval workflow (admin)
- [ ] Rejection workflow with reasons
- [ ] Access request notifications

**Deliverables:**
- Authorization middleware working
- Access request workflow end-to-end
- Admin approval system functional
- Notifications triggering properly

---

### Phase 6: User Management (Weeks 12-13)

**Objectives:** User profile and account management

- [ ] Get user profile query
- [ ] Update user profile command
- [ ] Change password command
- [ ] User search/filtering
- [ ] User list with pagination
- [ ] Deactivate user command
- [ ] User deletion workflow

**Deliverables:**
- User CRUD endpoints
- Profile updates working
- Password change flow
- Deactivation/deletion tested

---

### Phase 7: Audit & Logging (Week 14)

**Objectives:** Implement audit trail and logging

- [ ] Audit logger service
- [ ] Audit log persistence
- [ ] Audit query endpoints
- [ ] Serilog integration
- [ ] ELK stack setup
- [ ] Request logging middleware

**Deliverables:**
- Audit logs capturing all actions
- Queryable audit history
- Centralized logging working
- Log aggregation functional

---

### Phase 8: Caching & Performance (Week 15)

**Objectives:** Optimize with caching strategy

- [ ] Redis integration
- [ ] Session caching
- [ ] Query result caching
- [ ] Cache invalidation strategies
- [ ] Performance testing

**Deliverables:**
- Redis caching functional
- Query performance optimized
- Cache hit rates monitored

---

### Phase 9: Testing & Documentation (Weeks 16-17)

**Objectives:** Comprehensive testing and documentation

- [ ] Unit tests (Domain, Application) - Target: > 85% coverage
- [ ] Integration tests (All endpoints)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture documentation
- [ ] Development guide
- [ ] Deployment guide

**Deliverables:**
- Tests passing > 85% coverage
- Swagger UI functional
- Complete documentation
- Developer guide

---

### Phase 10: Security Hardening (Week 18)

**Objectives:** Final security audit and hardening

- [ ] Security code review
- [ ] OWASP Top 10 audit
- [ ] Penetration testing
- [ ] Rate limiting implementation
- [ ] CORS configuration
- [ ] Security headers

**Deliverables:**
- Security audit passed
- Rate limiting working
- Security headers configured
- OWASP compliance verified

---

### Phase 11: Deployment & Monitoring (Week 19)

**Objectives:** Production-ready setup

- [ ] Docker containerization
- [ ] Docker Compose setup
- [ ] Kubernetes manifests
- [ ] GitHub Actions CI/CD
- [ ] Prometheus monitoring
- [ ] Grafana dashboards
- [ ] Error alerting

**Deliverables:**
- Docker images built
- K8s deployment ready
- CI/CD pipeline functional
- Monitoring dashboards live

---

### Phase 12: Optimization & Polish (Week 20)

**Objectives:** Final optimization and stabilization

- [ ] Performance optimization
- [ ] Database query optimization
- [ ] API response caching
- [ ] Load testing
- [ ] Bug fixes
- [ ] Code cleanup
- [ ] Final documentation

**Deliverables:**
- Performance benchmarks met
- Load tests passing
- Production ready
- Fully documented

---

## Development Guidelines

### Code Structure

1. **Follow Clean Architecture** - Depend on abstractions, not implementations
2. **DDD Principles** - Business logic in domain layer, not application
3. **CQRS Pattern** - Separate reads and writes clearly
4. **Name Intent** - Classes and methods should clearly express purpose

### Naming Conventions

```csharp
// Commands (imperative)
public class RegisterUserCommand { }
public class ChangePasswordCommand { }

// Queries (nouns)
public class GetUserByIdQuery { }
public class GetPendingAccessRequestsQuery { }

// Events (past tense)
public class UserRegisteredEvent { }
public class PasswordChangedEvent { }

// Value Objects
public class Email { }
public class Password { }

// Aggregates (nouns, singular)
public class User : AggregateRoot { }
public class AccessRequest : AggregateRoot { }

// Services (interface + implementation)
public interface ITokenService { }
public class TokenService : ITokenService { }
```

### Error Handling

```csharp
// Domain exceptions (business logic violations)
public class InvalidEmailException : DomainException
{
    public InvalidEmailException() : base("Invalid email format") { }
}

// Application exceptions (validation, not found)
public class UserNotFoundException : ApplicationException
{
    public UserNotFoundException(Guid userId) 
        : base($"User with ID {userId} not found") { }
}

// Infrastructure exceptions (database, external services)
public class EmailServiceException : InfrastructureException
{
    public EmailServiceException(string message) : base(message) { }
}
```

### Testing

```csharp
// Unit tests - Domain logic
[Fact]
public void CreateUser_WithValidEmail_ShouldSucceed()
{
    // Arrange
    var email = new Email("user@example.com");
    
    // Act
    var user = User.Create(email, password, "John Doe");
    
    // Assert
    user.Should().NotBeNull();
    user.Email.Should().Be(email);
}

// Integration tests - Full flow
[Fact]
public async Task RegisterUser_EndToEnd_ShouldCreateUserAndSendEmail()
{
    // Arrange
    var command = new RegisterUserCommand 
    { 
        Email = "user@example.com",
        Password = "SecurePass123!"
    };
    
    // Act
    var result = await _commandHandler.Handle(command, CancellationToken.None);
    
    // Assert
    result.Should().NotBeNull();
    _emailServiceMock.Verify(x => x.SendEmail(...), Times.Once);
}
```

---

## Monitoring & Logging

### Logging Strategy

```csharp
// Service layer logging
_logger.LogInformation("User {UserId} registered with email {Email}", userId, email);
_logger.LogError("Email service failed for user {UserId}: {Error}", userId, error);

// Structured logging with Serilog
using (LogContext.PushProperty("UserId", userId))
{
    _logger.LogInformation("Processing user request");
}

// Output to multiple sinks
{
  "Timestamp": "2025-01-15T10:30:00.0000000Z",
  "Level": "Information",
  "MessageTemplate": "User {UserId} registered",
  "Properties": {
    "UserId": "550e8400-e29b-41d4-a716-446655440000",
    "Email": "user@example.com",
    "TraceId": "0HN4IRJVP9VJB:00000001"
  }
}
```

### Metrics & Monitoring

**Key Metrics:**
- Active users count
- Login success/failure rates
- API response times
- Database query times
- Cache hit/miss rates
- Error rates by endpoint
- Background job execution times

**Alerting Rules:**
- CPU usage > 80% for 5 minutes
- Memory usage > 85%
- Database connection pool exhaustion
- High error rate (> 5% of requests)
- Response time spike (p95 > 1 second)

---

## Contributing

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes following conventions
3. Write/update tests (maintain > 85% coverage)
4. Update documentation
5. Submit PR with clear description
6. Address code review feedback
7. Merge after approval and CI passes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): implement JWT refresh token rotation

- Add RefreshTokenService
- Implement token rotation on each refresh
- Add device binding validation
- Add integration tests

Fixes #123
```

---

## Support & Documentation

### Getting Started

1. Clone repository
2. Install .NET 9 SDK
3. Run `docker-compose up` for dependencies
4. Run `dotnet ef database update` for migrations
5. Start API: `dotnet run --project src/Services/Identity/Aeon.Identity.Api`

### API Documentation

- Swagger UI: `http://localhost:5000/swagger`
- OpenAPI spec: `http://localhost:5000/openapi.json`

### Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

---

## License

Aeon is licensed under the MIT License.

---

## Contact

- **Project Lead:** [Your Name]
- **Documentation:** See [docs/](./docs) folder
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0-alpha
