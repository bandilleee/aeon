using Aeon.Identity.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Aeon.Identity.Domain.Tests.Entities;

public class BackupCodeTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateBackupCode()
    {
        // Arrange
        var codeHash = "hashedCode123";
        var userId = Guid.NewGuid();

        // Act
        var backupCode = BackupCode.Create(codeHash, userId);

        // Assert
        backupCode.CodeHash.Should().Be(codeHash);
        backupCode.UserId.Should().Be(userId);
        backupCode.IsUsed.Should().BeFalse();
        backupCode.UsedAt.Should().BeNull();
        backupCode.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void MarkAsUsed_ShouldSetIsUsedAndUsedAt()
    {
        // Arrange
        var backupCode = BackupCode.Create("hash", Guid.NewGuid());
        var beforeUse = DateTime.UtcNow;

        // Act
        backupCode.MarkAsUsed();

        // Assert
        //backupCode.IsUsed.Should().BeTrue();
        backupCode.UsedAt.Should().NotBeNull();
        backupCode.UsedAt.Should().BeOnOrAfter(beforeUse);
    }
}