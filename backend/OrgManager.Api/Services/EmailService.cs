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

        private const string FROM_EMAIL = "aeonsnotifications@gmail.com";
        private const string FROM_NAME  = "Aeon Community";

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────────
        // CORE SEND
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
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

        var gmailUser = _config["Email:GmailUser"]
            ?? throw new InvalidOperationException("Email:GmailUser is not configured in appsettings.");
        var gmailPass = _config["Email:GmailPassword"]
            ?? throw new InvalidOperationException("Email:GmailPassword is not configured in appsettings.");

        await client.AuthenticateAsync(gmailUser, gmailPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("✉️  Email sent → {Email} | Subject: {Subject}", toEmail, subject);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌  Failed to send email to {Email} — {Message}", toEmail, ex.Message);
    }
}

        // ─────────────────────────────────────────────────────────────────
        // SHARED HTML TEMPLATE WRAPPER
        // ─────────────────────────────────────────────────────────────────
        private static string WrapInTemplate(string preheader, string bodyHtml) => $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"" />
  <title>Aeon Community</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background-color: #050505;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e4e4e7;
      -webkit-font-smoothing: antialiased;
    }}
    .email-shell {{
      max-width: 580px;
      margin: 40px auto;
      background: #0f0f0f;
      border: 1px solid #27272a;
      border-radius: 14px;
      overflow: hidden;
    }}
    .email-header {{
      background: #18181b;
      padding: 24px 32px;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .logo-mark {{
      width: 38px; height: 38px;
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 17px; font-weight: 800;
      color: #fff;
      letter-spacing: -1px;
      text-decoration: none;
    }}
    .logo-text {{
      font-size: 15px; font-weight: 700;
      color: #f4f4f5; letter-spacing: 0.5px;
    }}
    .email-body {{
      padding: 36px 32px 28px;
    }}
    .email-title {{
      font-size: 22px; font-weight: 800;
      color: #ffffff; letter-spacing: -0.6px;
      margin-bottom: 10px; line-height: 1.3;
    }}
    .email-subtitle {{
      font-size: 14px; color: #a1a1aa;
      line-height: 1.7; margin-bottom: 28px;
    }}
    .card {{
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 16px;
    }}
    .card-label {{
      font-size: 10px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 1.2px;
      color: #71717a; margin-bottom: 5px;
    }}
    .card-value {{
      font-size: 15px; color: #f4f4f5; font-weight: 500;
    }}
    .mono {{
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 13px; color: #d4d4d8;
      letter-spacing: 1.5px;
      display: inline-block;
    }}
    .btn {{
      display: inline-block;
      padding: 13px 28px;
      border-radius: 9px;
      font-size: 14px; font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.2px;
      margin-top: 8px;
    }}
    .btn-white  {{ background: #ffffff; color: #000000; }}
    .btn-green  {{ background: #10b981; color: #ffffff; }}
    .btn-red    {{ background: #ef4444; color: #ffffff; }}
    .btn-blue   {{ background: #3b82f6; color: #ffffff; }}
    .divider {{
      border: none; border-top: 1px solid #27272a;
      margin: 28px 0;
    }}
    .info-row {{
      display: flex; align-items: flex-start;
      gap: 12px; margin-bottom: 14px;
    }}
    .info-icon {{
      font-size: 16px; margin-top: 1px;
    }}
    .info-label {{
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 1px;
      color: #71717a; margin-bottom: 2px;
    }}
    .info-value {{ font-size: 14px; color: #d4d4d8; }}
    .note-box {{
      background: #1c1c1e;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 13px; color: #a1a1aa;
      line-height: 1.7; margin-top: 20px;
    }}
    .email-footer {{
      padding: 18px 32px 24px;
      border-top: 1px solid #27272a;
      font-size: 12px; color: #52525b;
      line-height: 1.7;
    }}
    .footer-links a {{
      color: #71717a; text-decoration: none;
      margin-right: 16px;
    }}
    .footer-links a:hover {{ color: #a1a1aa; }}
    .badge {{
      display: inline-block;
      padding: 3px 9px; border-radius: 9999px;
      font-size: 11px; font-weight: 600;
    }}
    .badge-green {{ background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }}
    .badge-red   {{ background: rgba(239,68,68,0.12);  color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }}
    .badge-blue  {{ background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }}
    .badge-gray  {{ background: rgba(113,113,122,0.15); color: #a1a1aa; border: 1px solid rgba(113,113,122,0.25); }}
  </style>
</head>
<body>
  <!-- Preheader (hidden preview text in email clients) -->
  <div style=""display:none;max-height:0;overflow:hidden;color:#050505;"">{preheader}</div>

  <div class=""email-shell"">
    <!-- Header / Logo -->
    <div class=""email-header"">
      <span class=""logo-mark"">A</span>
      <span class=""logo-text"">AEON</span>
    </div>

    <!-- Body -->
    <div class=""email-body"">
      {bodyHtml}
    </div>

    <!-- Footer -->
    <div class=""email-footer"">
      <div class=""footer-links"" style=""margin-bottom:6px;"">
        <a href=""http://localhost:3000"">Platform</a>
        <a href=""http://localhost:3000/settings"">Settings</a>
      </div>
      This email was sent by <strong>Aeon Community</strong> &mdash; aeonsnotifications@gmail.com<br/>
      Please do not reply to this email.
    </div>
  </div>
</body>
</html>";

        // ─────────────────────────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────────────────────────
        private static string PrimaryButton(string href, string label, string variant = "btn-white") =>
            $@"<a href=""{href}"" class=""btn {variant}"" style=""display:inline-block;"">{label}</a>";

        private static string DividerLine() =>
            @"<hr class=""divider"" />";

        private static string InfoRow(string icon, string label, string value) =>
            $@"<div class=""info-row"">
                 <span class=""info-icon"">{icon}</span>
                 <div>
                   <div class=""info-label"">{label}</div>
                   <div class=""info-value"">{value}</div>
                 </div>
               </div>";

        // ─────────────────────────────────────────────────────────────────
        // 1. WELCOME EMAIL — sent when access request is APPROVED
        // ─────────────────────────────────────────────────────────────────
        public async Task SendWelcomeEmailAsync(string toEmail, string displayName, string temporaryPassword)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">Welcome to Aeon! 🎉</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your access request has been approved. Your account is ready &mdash;
                use the credentials below to sign in for the first time.
              </div>

              <div class=""card"">
                <div class=""card-label"">Email Address</div>
                <div class=""card-value"">{toEmail}</div>
              </div>

              <div class=""card"">
                <div class=""card-label"">Temporary Password</div>
                <span class=""mono"">{temporaryPassword}</span>
              </div>

              <div class=""note-box"">
                ⚠️&nbsp; You will be <strong>required to set a new password</strong> immediately after your first login.
                Please keep this temporary password safe until then.
              </div>

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/login", "Sign In to Aeon →", "btn-green")}";

            await SendAsync(toEmail, displayName,
                "You're in! Your Aeon account is ready",
                WrapInTemplate("Your Aeon access has been approved. Here are your login credentials.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 2. PASSWORD RESET EMAIL
        // ─────────────────────────────────────────────────────────────────
        public async Task SendPasswordResetEmailAsync(
            string toEmail, string displayName, string resetToken, string frontendUrl)
        {
            var firstName  = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var resetLink  = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(toEmail)}";

            var body = $@"
              <div class=""email-title"">Reset Your Password</div>
              <div class=""email-subtitle"">
                Hi {firstName}, we received a request to reset the password for your Aeon account.
                Click the button below to choose a new password.
              </div>

              <div class=""card"">
                <div class=""card-label"">This link expires in</div>
                <div class=""card-value"">30 minutes</div>
              </div>

              {PrimaryButton(resetLink, "Reset My Password →", "btn-white")}

              {DividerLine()}

              <div class=""note-box"">
                🔒&nbsp; If you didn&rsquo;t request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </div>";

            await SendAsync(toEmail, displayName,
                "Reset your Aeon password",
                WrapInTemplate("Password reset link inside. Valid for 30 minutes.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 3. ACCESS REQUEST RECEIVED — confirmation to the requester
        // ─────────────────────────────────────────────────────────────────
        public async Task SendAccessRequestReceivedEmailAsync(
            string toEmail, string firstName, string lastName)
        {
            var displayName = $"{firstName} {lastName}";

            var body = $@"
              <div class=""email-title"">Request Received ✓</div>
              <div class=""email-subtitle"">
                Hi {firstName}, we&rsquo;ve received your request to join Aeon Community.
                An administrator will review it shortly.
              </div>

              <div class=""card"">
                <div class=""card-label"">What happens next</div>
                <div class=""card-value"" style=""font-size:13px;color:#a1a1aa;line-height:1.9;"">
                  1. An admin reviews your request<br/>
                  2. You&rsquo;ll receive an email with the outcome<br/>
                  3. If approved, you&rsquo;ll get your login credentials
                </div>
              </div>

              {DividerLine()}

              <div class=""note-box"">
                📬&nbsp; Keep an eye on your inbox. We typically review requests within 24&nbsp;hours.
              </div>";

            await SendAsync(toEmail, displayName,
                "We received your access request — Aeon",
                WrapInTemplate("Your Aeon access request is under review.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 4. ACCESS REQUEST REJECTED
        // ─────────────────────────────────────────────────────────────────
        public async Task SendAccessRejectedEmailAsync(
            string toEmail, string firstName, string lastName, string? reason)
        {
            var displayName  = $"{firstName} {lastName}";
            var reasonText   = string.IsNullOrWhiteSpace(reason)
                ? "No reason was provided."
                : reason;

            var body = $@"
              <div class=""email-title"">Access Request Update</div>
              <div class=""email-subtitle"">
                Hi {firstName}, we reviewed your request to join Aeon Community and unfortunately
                we&rsquo;re unable to approve it at this time.
              </div>

              <div class=""card"">
                <div class=""card-label"">Reason</div>
                <div class=""card-value"" style=""color:#a1a1aa;font-size:14px;"">{reasonText}</div>
              </div>

              {DividerLine()}

              <div class=""note-box"">
                If you believe this is a mistake or would like to appeal, please contact the
                community administrator directly.
              </div>";

            await SendAsync(toEmail, displayName,
                "Your Aeon access request — update",
                WrapInTemplate("An update on your Aeon access request.", body));
        }

        // ───────────────────────────────────────��─────────────────────────
        // 5. ADMIN NOTIFICATION — new access request submitted
        // ─────────────────────────────────────────────────────────────────
        public async Task SendAdminNewAccessRequestNotificationAsync(
            string adminEmail, string adminName,
            string requesterFirstName, string requesterLastName,
            string requesterEmail, string reason)
        {
            var requesterName = $"{requesterFirstName} {requesterLastName}";
            var adminFirstName = adminName.Split(' ').FirstOrDefault() ?? adminName;
            var adminUrl = "http://localhost:3000/admin/access-requests";

            var body = $@"
              <div class=""email-title"">New Access Request</div>
              <div class=""email-subtitle"">
                Hi {adminFirstName}, someone has submitted a new access request on Aeon.
                Review and approve or reject it from the admin panel.
              </div>

              {InfoRow("👤", "Name",   requesterName)}
              {InfoRow("✉️",  "Email",  requesterEmail)}
              {InfoRow("💬", "Reason", reason)}

              {DividerLine()}

              {PrimaryButton(adminUrl, "Review Request →", "btn-blue")}

              <div class=""note-box"" style=""margin-top:20px;"">
                This notification was sent because you are listed as an administrator on Aeon.
              </div>";

            await SendAsync(adminEmail, adminName,
                $"New access request from {requesterName} — Aeon",
                WrapInTemplate($"New access request from {requesterName}. Review required.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 6. PASSWORD CHANGED CONFIRMATION
        // ─────────────────────────────────────────────────────────────────
        public async Task SendPasswordChangedAsync(string toEmail, string displayName)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">Password Changed</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your Aeon account password was successfully updated.
              </div>

              {InfoRow("🕐", "Changed At", $"{DateTime.UtcNow:dd MMM yyyy, HH:mm} UTC")}

              {DividerLine()}

              <div class=""note-box"">
                🔐&nbsp; If you did not make this change, please contact your administrator immediately
                or use the forgot-password flow to regain control of your account.
              </div>

              {PrimaryButton("http://localhost:3000/login", "Sign In →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                "Your Aeon password was changed",
                WrapInTemplate("Your Aeon account password was updated.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 7. EVENT APPROVED — notification to the event creator
        // ─────────────────────────────────────────────────────────────────
        public async Task SendEventApprovedAsync(
            string toEmail, string displayName, string eventTitle)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">Event Approved ✓</div>
              <div class=""email-subtitle"">
                Hi {firstName}, great news! Your event has been approved and is now
                <span class=""badge badge-green"">Live</span> on the platform.
              </div>

              <div class=""card"">
                <div class=""card-label"">Event</div>
                <div class=""card-value"">{eventTitle}</div>
              </div>

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/events", "View Your Event →", "btn-green")}";

            await SendAsync(toEmail, displayName,
                $"Your event \"{eventTitle}\" is approved — Aeon",
                WrapInTemplate($"Your Aeon event \"{eventTitle}\" has been approved.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 8. EVENT REJECTED — notification to the event creator
        // ─────────────────────────────────────────────────────────────────
        public async Task SendEventRejectedAsync(
            string toEmail, string displayName, string eventTitle, string reason)
        {
            var firstName  = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var reasonText = string.IsNullOrWhiteSpace(reason)
                ? "No reason was provided."
                : reason;

            var body = $@"
              <div class=""email-title"">Event Not Approved</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your event submission was reviewed but could not be approved at this time.
              </div>

              <div class=""card"">
                <div class=""card-label"">Event</div>
                <div class=""card-value"">{eventTitle}</div>
              </div>

              <div class=""card"">
                <div class=""card-label"">Reason</div>
                <div class=""card-value"" style=""color:#a1a1aa;font-size:14px;"">{reasonText}</div>
              </div>

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/events/create", "Submit a New Event →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                $"Your event \"{eventTitle}\" was not approved — Aeon",
                WrapInTemplate($"Update on your Aeon event submission.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 9. EVENT REGISTRATION CONFIRMATION — sent to the registrant
        // ─────────────────────────────────────────────────────────────────
        public async Task SendEventRegistrationConfirmationAsync(
            string toEmail, string displayName,
            string eventTitle, string eventDate, string? location)
        {
            var firstName    = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var locationHtml = string.IsNullOrWhiteSpace(location)
                ? ""
                : InfoRow("📍", "Location", location);

            var body = $@"
              <div class=""email-title"">You&rsquo;re Registered! 🎟️</div>
              <div class=""email-subtitle"">
                Hi {firstName}, you&rsquo;ve successfully registered for the following event.
                We look forward to seeing you there!
              </div>

              <div class=""card"">
                <div class=""card-label"">Event</div>
                <div class=""card-value"">{eventTitle}</div>
              </div>

              {InfoRow("📅", "Date", eventDate)}
              {locationHtml}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/events", "View Event →", "btn-white")}

              <div class=""note-box"" style=""margin-top:20px;"">
                To cancel your registration, visit the event page and click &ldquo;Cancel Registration&rdquo;.
              </div>";

            await SendAsync(toEmail, displayName,
                $"You're registered for \"{eventTitle}\" — Aeon",
                WrapInTemplate($"Registration confirmed for \"{eventTitle}\".", body));
        }

                // ─────────────────────────────────────────────────────────────────
        // 10. FIRST-TIME SETUP COMPLETE — sent after set-password + 2FA done
        // ─────────────────────────────────────────────────────────────────
        public async Task SendAccountReadyAsync(string toEmail, string displayName)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">You're All Set! 🎉</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your Aeon account is fully set up and ready to go.
                Welcome to the community — we're glad to have you here.
              </div>

              {InfoRow("🔐", "Password", "Configured")}
              {InfoRow("✅", "Account Status", "Active")}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard", "Go to Your Dashboard →", "btn-green")}

              <div class=""note-box"" style=""margin-top:20px;"">
                💡&nbsp; Explore your dashboard, check out upcoming events, and connect with other members.
              </div>";

            await SendAsync(toEmail, displayName,
                "Your Aeon account is ready — welcome aboard!",
                WrapInTemplate("Your Aeon account setup is complete. Let's go!", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 11. EVENT CREATED — confirmation to the creator
        // ─────────────────────────────────────────────────────────────────
        public async Task SendEventCreatedAsync(
            string toEmail, string displayName,
            string eventTitle, string eventDate, bool requiresApproval)
        {
            var firstName   = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var statusNote  = requiresApproval
                ? "Your event is currently <span class=\"badge badge-gray\">Pending Review</span>. An admin will approve it shortly."
                : "Your event is now <span class=\"badge badge-green\">Live</span> on the platform.";

            var body = $@"
              <div class=""email-title"">Event Created ✓</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your event has been submitted successfully.
                {statusNote}
              </div>

              <div class=""card"">
                <div class=""card-label"">Event</div>
                <div class=""card-value"">{eventTitle}</div>
              </div>

              {InfoRow("📅", "Date", eventDate)}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard/events", "View Your Events →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                $"Event created: \"{eventTitle}\" — Aeon",
                WrapInTemplate($"Your Aeon event \"{eventTitle}\" was created successfully.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 12. TASK ASSIGNED — sent to the person assigned a task
        // ─────────────────────────────────────────────────────────────────
        public async Task SendTaskAssignedAsync(
            string toEmail, string displayName,
            string taskTitle, string assignedBy, string? dueDate, string priority)
        {
            var firstName  = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var dueDateHtml = string.IsNullOrWhiteSpace(dueDate)
                ? ""
                : InfoRow("📅", "Due Date", dueDate);

            var priorityBadgeClass = priority.ToLower() switch {
                "urgent" => "badge-red",
                "high"   => "badge-red",
                "medium" => "badge-blue",
                _        => "badge-gray"
            };

            var body = $@"
              <div class=""email-title"">You've Been Assigned a Task</div>
              <div class=""email-subtitle"">
                Hi {firstName}, {assignedBy} has assigned you a new task on Aeon.
              </div>

              <div class=""card"">
                <div class=""card-label"">Task</div>
                <div class=""card-value"">{taskTitle}</div>
              </div>

              {InfoRow("👤", "Assigned By", assignedBy)}
              {InfoRow("🚦", "Priority", $"<span class=\"badge {priorityBadgeClass}\">{priority}</span>")}
              {dueDateHtml}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard/tasks", "View Your Tasks →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                $"New task assigned: \"{taskTitle}\" — Aeon",
                WrapInTemplate($"You've been assigned a task on Aeon: \"{taskTitle}\".", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 13. TASK STATUS UPDATED — sent to the task creator
        // ─────────────────────────────────────────────────────────────────
        public async Task SendTaskStatusUpdatedAsync(
            string toEmail, string displayName,
            string taskTitle, string newStatus, string updatedBy)
        {
            var firstName  = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var badgeClass = newStatus.ToLower() switch {
                "completed"   => "badge-green",
                "in_review"   => "badge-blue",
                "in_progress" => "badge-blue",
                _             => "badge-gray"
            };
            var statusLabel = newStatus.Replace("_", " ") switch {
                "in progress" => "In Progress",
                "in review"   => "In Review",
                "completed"   => "Completed",
                _             => newStatus
            };

            var body = $@"
              <div class=""email-title"">Task Update</div>
              <div class=""email-subtitle"">
                Hi {firstName}, a task you're tracking has been updated.
              </div>

              <div class=""card"">
                <div class=""card-label"">Task</div>
                <div class=""card-value"">{taskTitle}</div>
              </div>

              {InfoRow("🔄", "New Status", $"<span class=\"badge {badgeClass}\">{statusLabel}</span>")}
              {InfoRow("👤", "Updated By", updatedBy)}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard/tasks", "View Task →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                $"Task update: \"{taskTitle}\" is now {statusLabel} — Aeon",
                WrapInTemplate($"Task \"{taskTitle}\" status changed to {statusLabel}.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 14. PROFILE UPDATED — confirmation to the user
        // ─────────────────────────────────────────────────────────────────
        public async Task SendProfileUpdatedAsync(string toEmail, string displayName)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">Profile Updated ✓</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your Aeon profile information was successfully updated.
              </div>

              {InfoRow("🕐", "Updated At", $"{DateTime.UtcNow:dd MMM yyyy, HH:mm} UTC")}

              {DividerLine()}

              <div class=""note-box"">
                🔐&nbsp; If you did not make this change, please contact your administrator immediately.
              </div>

              {PrimaryButton("http://localhost:3000/dashboard/settings", "Review Your Settings →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                "Your Aeon profile was updated",
                WrapInTemplate("Your Aeon profile information was updated.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // 15. EVENT REGISTRATION CANCELLED — sent to the member
        // ─────────────────────────────────────────────────────────────────
        public async Task SendEventRegistrationCancelledAsync(
            string toEmail, string displayName, string eventTitle)
        {
            var firstName = displayName.Split(' ').FirstOrDefault() ?? displayName;

            var body = $@"
              <div class=""email-title"">Registration Cancelled</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your registration for the following event has been cancelled.
              </div>

              <div class=""card"">
                <div class=""card-label"">Event</div>
                <div class=""card-value"">{eventTitle}</div>
              </div>

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard/events", "Browse Other Events →", "btn-white")}

              <div class=""note-box"" style=""margin-top:20px;"">
                If you didn&rsquo;t cancel this registration, please contact your administrator.
              </div>";

            await SendAsync(toEmail, displayName,
                $"Registration cancelled for \"{eventTitle}\" — Aeon",
                WrapInTemplate($"Your registration for \"{eventTitle}\" has been cancelled.", body));
        }

        // ─────────────────────────────────────────────────────────────────
        // TASK CREATED — confirmation to the creator
        // ─────────────────────────────────────────────────────────────────
        public async Task SendTaskCreatedAsync(
            string toEmail, string displayName,
            string taskTitle, string priority, string? dueDate)
        {
            var firstName     = displayName.Split(' ').FirstOrDefault() ?? displayName;
            var dueDateHtml   = string.IsNullOrWhiteSpace(dueDate)
                ? ""
                : InfoRow("📅", "Due Date", dueDate);

            var priorityBadgeClass = priority.ToLower() switch {
                "urgent" => "badge-red",
                "high"   => "badge-red",
                "medium" => "badge-blue",
                _        => "badge-gray"
            };

            var body = $@"
              <div class=""email-title"">Task Created ✓</div>
              <div class=""email-subtitle"">
                Hi {firstName}, your task has been created successfully.
              </div>

              <div class=""card"">
                <div class=""card-label"">Task</div>
                <div class=""card-value"">{taskTitle}</div>
              </div>

              {InfoRow("🚦", "Priority", $"<span class=\"badge {priorityBadgeClass}\">{priority}</span>")}
              {dueDateHtml}

              {DividerLine()}

              {PrimaryButton("http://localhost:3000/dashboard/tasks", "View Your Tasks →", "btn-white")}";

            await SendAsync(toEmail, displayName,
                $"Task created: \"{taskTitle}\" — Aeon",
                WrapInTemplate($"Your task \"{taskTitle}\" was created on Aeon.", body));
        }
    }
}