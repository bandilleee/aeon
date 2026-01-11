using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Repositories;
using Aeon.Identity.Infrastructure.Persistence;
using Aeon.Identity.Infrastructure.Persistence.Repositories;
using Aeon.Identity.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aeon.Identity.Infrastructure;

/// <summary>
/// Extension methods for registering Infrastructure layer services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Infrastructure layer services to the DI container.
    /// </summary>
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database Configuration
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("IdentityDb"),
                npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

        services.AddScoped<IdentityDbContextSeeder>();

        // Repositories & Persistence
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IBackupCodeRepository, BackupCodeRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Configuration Settings
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<TotpSettings>(configuration.GetSection(TotpSettings.SectionName));
        services.Configure<RecaptchaSettings>(configuration.GetSection(RecaptchaSettings.SectionName));
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));

        // Infrastructure Services
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenHasher, TokenHasher>();
        services.AddSingleton<IJwtService, JwtService>();
        services.AddSingleton<ITotpService, TotpService>();
        
        services.AddScoped<IEmailService, EmailService>();
        services.AddHttpClient<IRecaptchaService, RecaptchaService>();

        return services;
    }
}