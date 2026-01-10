namespace Aeon.Identity.Application.DTOs;

public sealed class TwoFactorSetupResult
{
    public required string Secret { get; init; }
    public required string QrCodeUri { get; init; }
}