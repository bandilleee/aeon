using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aeon.Identity.Infrastructure.Persistence;

/// <summary>
/// Handles the initial migration and seeding of the Identity database.
/// </summary>
public sealed partial class IdentityDbContextSeeder
{
    private readonly IdentityDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<IdentityDbContextSeeder> _logger;

    public IdentityDbContextSeeder(
        IdentityDbContext dbContext,
        IPasswordHasher passwordHasher,
        ILogger<IdentityDbContextSeeder> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    /// <summary>
    /// Executes the seeding logic, including applying pending migrations.
    /// </summary>
    public async Task SeedAsync()
    {
        try
        {
            await _dbContext.Database.MigrateAsync();
            await SeedAdminUserAsync();
        }
        catch (Exception ex)
        {
            LogSeedError(_logger, ex);
            throw;
        }
    }

    private async Task SeedAdminUserAsync()
    {
        if (await _dbContext.Users.AnyAsync())
        {
            LogSkippingSeed(_logger);
            return;
        }

        LogSeedingAdmin(_logger);

        // Define initial credentials; user should change this upon first login
        const string temporaryPassword = "Admin@123";
        var passwordHash = _passwordHasher.Hash(temporaryPassword);

        var adminUser = User.Create(
            email: "Bandiillleee@gmail.com",
            firstName: "System",
            lastName: "Administrator",
            passwordHash: passwordHash,
            role: Role.Admin);

        await _dbContext.Users.AddAsync(adminUser);
        await _dbContext.SaveChangesAsync();

        LogAdminCreated(_logger, temporaryPassword);
    }

    // High-performance Source-Generated Logging
    [LoggerMessage(Level = LogLevel.Error, Message = "An error occurred while seeding the database.")]
    private static partial void LogSeedError(ILogger logger, Exception exception);

    [LoggerMessage(Level = LogLevel.Information, Message = "Database already contains users; skipping seed.")]
    private static partial void LogSkippingSeed(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Seeding admin user...")]
    private static partial void LogSeedingAdmin(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Admin user created successfully. Email: Bandiillleee@gmail.com, Temporary Password: {Password}")]
    private static partial void LogAdminCreated(ILogger logger, string password);
}