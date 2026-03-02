using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace OrgManager.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        // Aeon sender identity
        private const string FROM_EMAIL = "aeonsnotifications@gmail.com";
        private const string FROM_NAME  = "Aeon Community";

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────────
        //  Core send method
        // ─────────────────────────────────────────────────────────────────
        private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(FROM_NAME, FROM_EMAIL));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;
                message.Body    = new TextPart(TextFormat.Html) { Text = htmlBody };

                using var client = new SmtpClient();

                // Connect to Gmail SMTP with STARTTLS
                await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

                // Use Gmail App Password from config
                var gmailUser     = _config["Email:GmailUser"]     ?? FROM_EMAIL;
                var gmailPassword = _config["Email:GmailPassword"] ?? "";
                await client.AuthenticateAsync(gmailUser, gmailPassword);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("✉️  Email sent to {Email} — Subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌  Failed to send email to {Email}", toEmail);
                // Don't throw — email failure should never crash the API
            }
        }

        // ─────────────────────────────────────────────────────────────────
        //  Shared HTML wrapper  (Aeon dark-branded design)
        // ─────────────────────────────────────────────────────────────────
        private static string WrapInTemplate(string preheader, string bodyHtml)
        {
            return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Aeon</title>
              <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
            </head>
            <body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <!-- Preheader (hidden preview text) -->
              <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{preheader}</div>

              <!-- Outer wrapper -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

                      <!-- LOGO HEADER -->
                      <tr>
                        <td align="center" style="padding-bottom:32px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background-color:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 20px;">
                                <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">✦ Aeon</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- CARD -->
                      <tr>
                        <td style="background-color:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:40px 40px 36px;">
                          {bodyHtml}
                        </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                        <td align="center" style="padding-top:28px;">
                          <p style="margin:0;font-size:12px;color:#3f3f46;line-height:1.6;">
                            You're receiving this because you have an account on Aeon Community.<br/>
                            If you didn't expect this, you can safely ignore it.
                          </p>
                          <p style="margin:8px 0 0;font-size:11px;color:#27272a;">
                            © 2025 Aeon Community. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
        }

        // ─────────────────────────────────────────────────────────────────
        //  Shared button component
        // ─────────────────────────────────────────────────────────────────
        private static string PrimaryButton(string href, string label) => $"""
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0;">
              <tr>
                <td style="border-radius:10px;background-color:#ffffff;">
                  <a href="{href}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#000000;text-decoration:none;letter-spacing:-0.1px;">{label} →</a>
                </td>
              </tr>
            </table>
            """;

        private static string DividerLine() => """
            <div style="height:1px;background:rgba(255,255,255,0.06);margin:28px 0;"></div>
            """;

        private static string InfoRow(string icon, string label, string value) => $"""
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:13px;color:#52525b;">{icon} {label}:&nbsp;</span>
                <span style="font-size:13px;color:#a1a1aa;font-weight:500;">{value}</span>
              </td>
            </tr>
            """;

        // ═════════════════════════════════════════════════════════════════
        //  1. WELCOME EMAIL  (sent when access request is approved)
        // ═════════════════════════════════════════════════════════════════
        public async Task SendWelcomeEmailAsync(string toEmail, string displayName, string temporaryPassword)
        {
            var firstName = displayName.Split(' ')[0];

            var body = $"""
                <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Welcome to Aeon ✦</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                  Hey {firstName}, your access request has been approved. You're in.
                </p>
                {DividerLine()}
                <p style="margin:0 0 12px;font-size:13px;color:#52525b;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">YOUR LOGIN DETAILS</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a1a1a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 20px;margin-bottom:4px;">
                  <tr><td style="padding:6px 0;"><span style="font-size:13px;color:#52525b;">📧 Email:&nbsp;</span><span style="font-size:13px;color:#a1a1aa;font-weight:500;">{toEmail}</span></td></tr>
                  <tr><td style="padding:6px 0;"><span style="font-size:13px;color:#52525b;">🔑 Temporary password:&nbsp;</span><span style="font-size:13px;color:#f4f4f5;font-weight:600;font-family:monospace;background:#262626;padding:2px 8px;border-radius:4px;">{temporaryPassword}</span></td></tr>
                </table>
                {DividerLine()}
                <div style="background-color:#18181b;border:1px solid rgba(245,158,11,0.2);border-left:3px solid #f59e0b;border-radius:8px;padding:14px 16px;margin-bottom:4px;">
                  <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                    ⚠️ You'll be asked to set a new password on your first login. Keep this temporary password safe until then.
                  </p>
                </div>
                {PrimaryButton("http://localhost:3000/login", "Sign In to Aeon")}
                """;

            await SendAsync(toEmail, displayName, "✦ Welcome to Aeon — Your access has been approved", WrapInTemplate($"Hey {firstName}, you're in! Your Aeon account is ready.", body));
        }

        // ═════════════════════════════════════════════════════════════════
        //  2. PASSWORD RESET EMAIL
        // ═════════════════════════════════════════════════════════════════
        public async Task SendPasswordResetEmailAsync(string toEmail, string displayName, string resetToken, string frontendUrl)
        {
            var firstName  = displayName.Split(' ')[0];
            var resetLink  = $"{frontendUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(toEmail)}";
            var expiryMins = 30;

            var body = $"""
                <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Reset your password</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                  Hey {firstName}, we received a request to reset your Aeon password. Click the button below to continue.
                </p>
                {PrimaryButton(resetLink, "Reset Password")}
                {DividerLine()}
                <div style="background-color:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px 16px;">
                  <p style="margin:0 0 8px;font-size:12px;color:#52525b;text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">LINK DETAILS</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    {InfoRow("⏱", "Expires in", $"{expiryMins} minutes")}
                    {InfoRow("🔒", "One-time use", "Yes — link expires after use")}
                  </table>
                </div>
                {DividerLine()}
                <p style="margin:0;font-size:12px;color:#3f3f46;line-height:1.6;">
                  If you didn't request a password reset, you can safely ignore this email. Your password won't change.
                </p>
                <p style="margin:12px 0 0;font-size:11px;color:#27272a;">Or paste this link into your browser:</p>
                <p style="margin:4px 0 0;font-size:11px;color:#3f3f46;word-break:break-all;">{resetLink}</p>
                """;

            await SendAsync(toEmail, displayName, "Reset your Aeon password", WrapInTemplate($"Reset your Aeon password — link expires in {expiryMins} minutes.", body));
        }

        // ═════════════════════════════════════════════════════════════════
        //  3. ACCESS REQUEST RECEIVED  (confirmation to the requester)
        // ═════════════════════════════════════════════════════════════════
        public async Task SendAccessRequestReceivedEmailAsync(string toEmail, string firstName, string lastName)
        {
            var fullName = $"{firstName} {lastName}";
            var body = $"""
                <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Request received ✓</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                  Hey {firstName}, we've received your request to join Aeon. Our team will review it and get back to you shortly.
                </p>
                {DividerLine()}
                <div style="background-color:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;">
                  <p style="margin:0 0 12px;font-size:13px;color:#52525b;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">WHAT HAPPENS NEXT</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                        <span style="font-size:13px;color:#a1a1aa;">1.&nbsp;&nbsp;</span>
                        <span style="font-size:13px;color:#71717a;">An admin reviews your request — usually within 24 hours</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                        <span style="font-size:13px;color:#a1a1aa;">2.&nbsp;&nbsp;</span>
                        <span style="font-size:13px;color:#71717a;">You'll receive an email with your login credentials if approved</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;">
                        <span style="font-size:13px;color:#a1a1aa;">3.&nbsp;&nbsp;</span>
                        <span style="font-size:13px;color:#71717a;">Sign in and set your permanent password</span>
                      </td>
                    </tr>
                  </table>
                </div>
                """;

            await SendAsync(toEmail, fullName, "✦ Aeon — We've received your access request", WrapInTemplate("Your request to join Aeon is under review.", body));
        }

        // ═════════════════════════════════════════════════════════════════
        //  4. ACCESS REQUEST REJECTED
        // ═════════════════════════════════════════════════════════════════
        public async Task SendAccessRejectedEmailAsync(string toEmail, string firstName, string lastName, string? reason)
        {
            var fullName = $"{firstName} {lastName}";
            var reasonBlock = string.IsNullOrWhiteSpace(reason)
                ? ""
                : $"""
                  {DividerLine()}
                  <p style="margin:0 0 8px;font-size:13px;color:#52525b;text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">REASON</p>
                  <div style="background-color:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;font-style:italic;">"{reason}"</p>
                  </div>
                  """;

            var body = $"""
                <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Access not approved</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                  Hey {firstName}, after reviewing your request, we're unable to approve your access to Aeon at this time.
                </p>
                {reasonBlock}
                {DividerLine()}
                <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">
                  If you believe this is a mistake or would like to submit a new request with additional information, please reach out to the community admin.
                </p>
                """;

            await SendAsync(toEmail, fullName, "Aeon — Access request update", WrapInTemplate("An update on your Aeon access request.", body));
        }

        // ═════════════════════════════════════════════════════════════════
        //  5. ADMIN NOTIFICATION — new access request received
        // ═════════════════════════════════════════════════════════════════
        public async Task SendAdminNewAccessRequestNotificationAsync(string adminEmail, string adminName, string requesterFirstName, string requesterLastName, string requesterEmail, string reason)
        {
            var requesterFullName = $"{requesterFirstName} {requesterLastName}";

            var body = $"""
                <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">New access request</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                  A new user has requested access to Aeon and is awaiting your review.
                </p>
                {DividerLine()}
                <div style="background-color:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;margin-bottom:4px;">
                  <p style="margin:0 0 12px;font-size:13px;color:#52525b;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">REQUESTER DETAILS</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    {InfoRow("👤", "Name",  requesterFullName)}
                    {InfoRow("📧", "Email", requesterEmail)}
                    {InfoRow("📝", "Reason", reason.Length > 80 ? reason[..80] + "…" : reason)}
                    {InfoRow("🕐", "Submitted", DateTime.UtcNow.ToString("dd MMM yyyy, HH:mm") + " UTC")}
                  </table>
                </div>
                {PrimaryButton("http://localhost:3000/admin/access-requests", "Review Request")}
                """;

            await SendAsync(adminEmail, adminName, "✦ Aeon Admin — New access request from " + requesterFullName, WrapInTemplate($"New access request from {requesterFullName} awaiting review.", body));
        }
    }
}