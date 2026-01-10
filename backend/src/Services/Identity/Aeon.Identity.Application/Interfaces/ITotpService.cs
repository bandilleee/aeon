namespace Aeon.Identity.Application.Interfaces;

public interface ITotpService
{
    string GenerateSecret();

    string GenerateQrCodeUri(string email, string secret);

    bool ValidateCode(string secret, string code);

    IReadOnlyList<string> GenerateBackupCodes(int count = 10);
}