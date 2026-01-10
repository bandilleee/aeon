using Aeon.Identity.Application.Interfaces;
using Microsoft.Extensions.Options;
using OtpNet;
using System.Security.Cryptography;
using System.Text;

namespace Aeon.Identity.Infrastructure.Services;

public sealed class TotpService : ITotpService
{
    private readonly TotpSettings _settings;

    public TotpService(IOptions<TotpSettings> settings)
    {
        _settings = settings.Value;
    }

    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    public string GenerateQrCodeUri(string email, string secret)
    {
        var encodedIssuer = Uri.EscapeDataString(_settings.Issuer);
        var encodedEmail = Uri.EscapeDataString(email);
        return $"otpauth://totp/{encodedIssuer}:{encodedEmail}?secret={secret}&issuer={encodedIssuer}";
    }

    public bool ValidateCode(string secret, string code)
    {
        try
        {
            var secretBytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(secretBytes);

            return totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
        }
        catch
        {
            return false;
        }
    }

    public IReadOnlyList<string> GenerateBackupCodes(int count = 10)
    {
        var codes = new List<string>(count);

        for (var i = 0; i < count; i++)
        {
            codes.Add(GenerateBackupCode());
        }

        return codes;
    }

    private static string GenerateBackupCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var sb = new StringBuilder(14);
        var randomBytes = new byte[12];

        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        for (var i = 0; i < 12; i++)
        {
            if (i > 0 && i % 4 == 0)
            {
                sb.Append('-');
            }

            sb.Append(chars[randomBytes[i] % chars.Length]);
        }

        return sb.ToString();
    }
}