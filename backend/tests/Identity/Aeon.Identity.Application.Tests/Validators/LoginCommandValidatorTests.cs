using Aeon.Identity.Application.Commands.Login;
using FluentValidation.TestHelper;
using Xunit;

namespace Aeon.Identity.Application.Tests.Validators;

public class LoginCommandValidatorTests
{
    private readonly LoginCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "test@example.com",
            Password = "Password123!",
            RememberMe = false
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyEmail_ShouldHaveError(string email)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = email,
            Password = "Password123!",
            RememberMe = false
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missing@")]
    [InlineData("@nodomain.com")]
    public void Validate_WithInvalidEmail_ShouldHaveError(string email)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = email,
            Password = "Password123!",
            RememberMe = false
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyPassword_ShouldHaveError(string password)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "test@example.com",
            Password = password,
            RememberMe = false
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}