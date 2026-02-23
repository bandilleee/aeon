using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// --- NEW CORS CODE STARTS HERE ---
// Tell the app to allow requests from our Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Your Next.js URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// --- NEW CORS CODE ENDS HERE ---

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=orgmanager.db"));

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

var app = builder.Build();

// --- TELL THE APP TO USE CORS ---
// This MUST go before UseAuthentication!
app.UseCors("AllowNextJs");

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();