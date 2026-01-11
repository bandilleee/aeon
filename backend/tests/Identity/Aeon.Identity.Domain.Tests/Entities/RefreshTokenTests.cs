using Aeon.Identity.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Aeon.Identity.Domain.Tests.Entities;

public class RefreshTokenTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateRefreshToken()
    {
        // Arrange
        var tokenHash = "hashedToken123";
        var userId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddDays(7);

        // Act
        var token = RefreshToken.Create(tokenHash, userId, expiresAt);

        // Assert
        token.TokenHash.Should().Be(tokenHash);
        token.UserId.Should().Be(userId);
        token.ExpiresAt.Should().Be(expiresAt);
        token.IsRevoked.Should().BeFalse();
        token.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Revoke_ShouldSetIsRevokedToTrue()
    {
        // Arrange
        var token = RefreshToken.Create(
            "hash",
            Guid.NewGuid(),
            DateTime.UtcNow.AddDays(7));

        // Act
        token.Revoke();

        // Assert
        token.IsRevoked.Should().BeTrue();
    }
}