# Build stage: Uses the .NET SDK to compile and publish the app
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching
COPY ["Aeon.sln", "./"]
COPY ["src/Shared/Aeon.Common.Kernel/Aeon.Common.Kernel.csproj", "src/Shared/Aeon.Common.Kernel/"]
COPY ["src/BuildingBlocks/Aeon.BuildingBlocks.CQRS/Aeon.BuildingBlocks.CQRS.csproj", "src/BuildingBlocks/Aeon.BuildingBlocks.CQRS/"]
COPY ["src/BuildingBlocks/Aeon.BuildingBlocks.Web/Aeon.BuildingBlocks.Web.csproj", "src/BuildingBlocks/Aeon.BuildingBlocks.Web/"]
COPY ["src/Services/Identity/Aeon.Identity.Domain/Aeon.Identity.Domain.csproj", "src/Services/Identity/Aeon.Identity.Domain/"]
COPY ["src/Services/Identity/Aeon.Identity.Application/Aeon.Identity.Application.csproj", "src/Services/Identity/Aeon.Identity.Application/"]
COPY ["src/Services/Identity/Aeon.Identity.Infrastructure/Aeon.Identity.Infrastructure.csproj", "src/Services/Identity/Aeon.Identity.Infrastructure/"]
COPY ["src/Services/Identity/Aeon.Identity.Api/Aeon.Identity.Api.csproj", "src/Services/Identity/Aeon.Identity.Api/"]

# Restore dependencies based on the project files
RUN dotnet restore "src/Services/Identity/Aeon.Identity.Api/Aeon.Identity.Api.csproj"

# Copy the rest of the source code
COPY . .

# Build and Publish the application to the /app/publish directory
WORKDIR "/src/src/Services/Identity/Aeon.Identity.Api"
RUN dotnet publish "Aeon.Identity.Api.csproj" -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Runtime stage: A lightweight image containing only the .NET runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

# Copy the compiled output from the build stage
COPY --from=build /app/publish .

# Application Configuration
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Aeon.Identity.Api.dll"]