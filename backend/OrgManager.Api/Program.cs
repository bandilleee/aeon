using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// ==================== CORS ====================
// Allow frontend to talk to backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",   // Next.js dev server
            "http://127.0.0.1:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// ==================== CONTROLLERS ====================
builder.Services.AddControllers();

// ==================== DATABASE ====================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=orgmanager.db"));

// ==================== JWT AUTHENTICATION ====================
var jwtSecret = builder.Configuration["JwtSettings:SecretKey"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret!))
        };
    });

// ==================== SWAGGER (for testing) ====================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ==================== SEED DATABASE ====================
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.InitializeAsync(context);
}

// ==================== DEVELOPMENT: Enable Swagger ====================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==================== MIDDLEWARE PIPELINE ====================
// Order matters! CORS must come before Auth
app.UseCors("AllowNextJs");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine(" Aeon API is running on http://localhost:5073");
Console.WriteLine(" Swagger UI: http://localhost:5073/swagger");

app.Run();