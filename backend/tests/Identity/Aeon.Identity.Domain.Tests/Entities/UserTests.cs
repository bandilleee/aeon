using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Aeon.Identity.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateUser()
    {
        // Arrange
        const string email = "test@example.com";
        const string firstName = "John";
        const string lastName = "Doe";
        const string passwordHash = "hashedPassword123";
        const Role role = Role.Admin;

        // Act
        var user = User.Create(email, firstName, lastName, passwordHash, role);

        // Assert
        user.Email.Should().Be(email);
        user.FirstName.Should().Be(firstName);
        user.LastName.Should().Be(lastName);
        user.PasswordHash.Should().Be(passwordHash);
        user.Role.Should().Be(role);
        user.Status.Should().Be(UserStatus.Active);
        user.TwoFactorEnabled.Should().BeFalse();
        user.RequiresPasswordChange.Should().BeTrue();
        user.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void FullName_ShouldReturnFirstAndLastName()
    {
        // Arrange
        var user = User.Create("test@example.com", "John", "Doe", "hash", Role.Admin);

        // Act
        var fullName = user.FullName;

        // Assert
        fullName.Should().Be("John Doe");
    }

    [Fact]
    public void ChangePassword_ShouldChangePasswordHash()
    {
        // Arrange
        var user = User.Create("test@example.com", "John", "Doe", "oldHash", Role.Admin);
        const string newHash = "newHashedPassword";

        // Act
        user.ChangePassword(newHash);

        // Assert
        user.PasswordHash.Should().Be(newHash);
        user.RequiresPasswordChange.Should().BeFalse();
        user.PasswordResetToken.Should().BeNull();
        user.PasswordResetTokenExpiry.Should().BeNull();
    }
}
