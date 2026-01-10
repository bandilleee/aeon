using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Repositories;
using Aeon.Identity.Infrastructure.Persistence;
using Aeon.Identity.Infrastructure.Persistence.Repositories;
using Aeon.Identity.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aeon.Identity.Infrastructure;

// Extension methods for registering Infrastructure layer services.
public static class DependencyInjection
{
    // Adds Infrastructure layer services to the DI container.
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("IdentityDb"),
                npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IBackupCodeRepository, BackupCodeRepository>();

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Settings
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<TotpSettings>(configuration.GetSection(TotpSettings.SectionName));

        // Services
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenHasher, TokenHasher>();
        services.AddSingleton<IJwtService, JwtService>();
        services.AddSingleton<ITotpService, TotpService>();

        return services;
    }
}