namespace Aeon.Identity.Application.Interfaces;

public interface IRecaptchaService
{
    Task<bool> ValidateAsync(string token, string expectedAction, CancellationToken cancellationToken = default);
}