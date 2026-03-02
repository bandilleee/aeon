using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;
using System.Text.Json;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/settings")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _auditService;

        public SystemSettingsController(AppDbContext context, AuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        // GET: api/admin/settings
        [HttpGet]
        public async Task<ActionResult<ApiResponse<JsonElement>>> GetSettings()
        {
            var row = await _context.SystemSettings.FindAsync(1);

            if (row == null || string.IsNullOrWhiteSpace(row.SettingsJson) || row.SettingsJson == "{}")
            {
                // Return null data — frontend will use its own defaults
                return Ok(new ApiResponse<JsonElement?> { Success = true, Data = null });
            }

            try
            {
                // Deserialize as JsonElement so it returns the full nested object correctly
                var parsed = JsonSerializer.Deserialize<JsonElement>(row.SettingsJson);
                return Ok(new ApiResponse<JsonElement> { Success = true, Data = parsed });
            }
            catch
            {
                return Ok(new ApiResponse<JsonElement?> { Success = true, Data = null });
            }
        }

        // PUT: api/admin/settings
        [HttpPut]
        public async Task<ActionResult<ApiResponse<bool>>> SaveSettings([FromBody] JsonElement body)
        {
            var actorId    = User.FindFirst("id")?.Value ?? "admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";
            var actorName  = User.FindFirst("displayName")?.Value ?? "Admin";

            var row = await _context.SystemSettings.FindAsync(1);

            if (row == null)
            {
                row = new SystemSetting
                {
                    Id           = 1,
                    SettingsJson = body.GetRawText(),
                    UpdatedAt    = DateTime.UtcNow,
                    UpdatedBy    = actorEmail
                };
                _context.SystemSettings.Add(row);
            }
            else
            {
                row.SettingsJson = body.GetRawText();
                row.UpdatedAt    = DateTime.UtcNow;
                row.UpdatedBy    = actorEmail;
            }

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode:  "SYSTEM_SETTINGS_UPDATE",
                action:      "System Settings Updated",
                category:    "system",
                description: "Admin updated system settings",
                actorId:     actorId,
                actorName:   actorName,
                actorEmail:  actorEmail,
                actorRole:   "admin",
                severity:    "warning",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // POST: api/admin/settings/backup
        // Triggers a backup of the SQLite database file
        [HttpPost("backup")]
        public async Task<ActionResult<ApiResponse<object>>> TriggerBackup()
        {
            var actorId    = User.FindFirst("id")?.Value ?? "admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";
            var actorName  = User.FindFirst("displayName")?.Value ?? "Admin";

            try
            {
                var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "orgmanager.db");

                if (!System.IO.File.Exists(dbPath))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Error   = new { message = "Database file not found." }
                    });
                }

                // Create backups directory
                var backupsDir = Path.Combine(Directory.GetCurrentDirectory(), "backups");
                Directory.CreateDirectory(backupsDir);

                var timestamp  = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
                var backupFile = Path.Combine(backupsDir, $"orgmanager_backup_{timestamp}.db");

                System.IO.File.Copy(dbPath, backupFile, overwrite: true);

                var fileInfo = new FileInfo(backupFile);
                var sizeMb   = Math.Round(fileInfo.Length / 1_048_576.0, 2);
                var sizeStr  = sizeMb < 1 ? $"{Math.Round(fileInfo.Length / 1024.0, 1)} KB" : $"{sizeMb} MB";

                // Update settings row with backup metadata
                var row = await _context.SystemSettings.FindAsync(1);
                if (row != null)
                {
                    // Try to patch lastBackupAt, lastBackupSize, lastBackupStatus into the stored JSON
                    try
                    {
                        var existing = JsonSerializer.Deserialize<JsonElement>(row.SettingsJson);
                        using var stream = new System.IO.MemoryStream();
                        using var writer = new Utf8JsonWriter(stream);
                        writer.WriteStartObject();
                        // Copy all existing properties
                        foreach (var prop in existing.EnumerateObject())
                        {
                            if (prop.Name == "backups")
                            {
                                // Patch the backups section
                                writer.WritePropertyName("backups");
                                writer.WriteStartObject();
                                foreach (var bp in prop.Value.EnumerateObject())
                                {
                                    if (bp.Name is "lastBackupAt" or "lastBackupSize" or "lastBackupStatus")
                                        continue;
                                    bp.WriteTo(writer);
                                }
                                writer.WriteString("lastBackupAt",     DateTime.UtcNow.ToString("o"));
                                writer.WriteString("lastBackupSize",   sizeStr);
                                writer.WriteString("lastBackupStatus", "success");
                                writer.WriteEndObject();
                            }
                            else
                            {
                                prop.WriteTo(writer);
                            }
                        }
                        writer.WriteEndObject();
                        await writer.FlushAsync();
                        row.SettingsJson = System.Text.Encoding.UTF8.GetString(stream.ToArray());
                        row.UpdatedAt    = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                    catch { /* if JSON patching fails, still return success */ }
                }

                await _auditService.LogAsync(
                    actionCode:  "BACKUP_TRIGGERED",
                    action:      "Manual Backup",
                    category:    "system",
                    description: $"Admin triggered manual database backup ({sizeStr})",
                    actorId:     actorId,
                    actorName:   actorName,
                    actorEmail:  actorEmail,
                    actorRole:   "admin",
                    severity:    "info",
                    result:      "success",
                    ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
                );

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data    = new
                    {
                        backupFile    = Path.GetFileName(backupFile),
                        backupSize    = sizeStr,
                        backedUpAt    = DateTime.UtcNow.ToString("o"),
                        status        = "success"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = $"Backup failed: {ex.Message}" }
                });
            }
        }

        // GET: api/admin/settings/backup/download
        // Downloads the most recent backup file
        [HttpGet("backup/download")]
        public IActionResult DownloadLatestBackup()
        {
            var backupsDir = Path.Combine(Directory.GetCurrentDirectory(), "backups");

            if (!Directory.Exists(backupsDir))
                return NotFound(new { message = "No backups found. Run a backup first." });

            var latestBackup = Directory.GetFiles(backupsDir, "*.db")
                .OrderByDescending(f => f)
                .FirstOrDefault();

            if (latestBackup == null)
                return NotFound(new { message = "No backup files found." });

            var fileBytes = System.IO.File.ReadAllBytes(latestBackup);
            var fileName  = Path.GetFileName(latestBackup);
            return File(fileBytes, "application/octet-stream", fileName);
        }
    }
}