# ===========================================
# Aeon Identity API - Multi-stage Dockerfile
# ===========================================

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build

WORKDIR /src

# Copy solution file
COPY ["Aeon.sln", "./"]

# Copy project files for restore
COPY ["src/BuildingBlocks/Aeon.BuildingBlocks.CQRS/Aeon.BuildingBlocks.CQRS.csproj", "src/BuildingBlocks/Aeon.BuildingBlocks.CQRS/"]
COPY ["src/BuildingBlocks/Aeon.BuildingBlocks.Web/Aeon.BuildingBlocks.Web.csproj", "src/BuildingBlocks/Aeon.BuildingBlocks.Web/"]
COPY ["src/Shared/Aeon.Common.Kernel/Aeon.Common.Kernel.csproj", "src/Shared/Aeon.Common.Kernel/"]
COPY ["src/Services/Identity/Aeon.Identity.Domain/Aeon.Identity.Domain.csproj", "src/Services/Identity/Aeon.Identity.Domain/"]
COPY ["src/Services/Identity/Aeon.Identity.Application/Aeon.Identity.Application.csproj", "src/Services/Identity/Aeon.Identity.Application/"]
COPY ["src/Services/Identity/Aeon.Identity.Infrastructure/Aeon.Identity.Infrastructure.csproj", "src/Services/Identity/Aeon.Identity.Infrastructure/"]
COPY ["src/Services/Identity/Aeon.Identity.Api/Aeon.Identity.Api.csproj", "src/Services/Identity/Aeon.Identity.Api/"]

# Restore dependencies
RUN dotnet restore "src/Services/Identity/Aeon.Identity.Api/Aeon.Identity.Api.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR /src/src/Services/Identity/Aeon.Identity.Api
RUN dotnet build -c Release -o /app/build --no-restore

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r aeon && useradd -r -g aeon aeon

# Copy published files
COPY --from=publish /app/publish .

# Change ownership
RUN chown -R aeon:aeon /app

# Switch to non-root user
USER aeon

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Entry point
ENTRYPOINT ["dotnet", "Aeon.Identity.Api.dll"]
