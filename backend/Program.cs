using App;
using App.Data;
using App.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddSignalR();
builder.Services.AddSingleton<ExpoPushService>();
builder.Services.AddScoped<ChatService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();
var logger = app.Logger;

app.UseCors();
app.MapControllers();

// Run database migrations with retry on startup.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    await MigrateWithRetryAsync(remainingTries: 6);
    
    async Task MigrateWithRetryAsync(int remainingTries)
    {
        if (remainingTries < 1)
        {
            logger.LogCritical("Database migration failed after exhausting all retries. Shutting down.");
            throw new InvalidOperationException("Database migration failed after exhausting all retries.");
        }

        try
        {
            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Database migration succeeded.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "SQL Server retrying connection ({Remaining} tries left).", remainingTries - 1);
            await Task.Delay(8000);
            await MigrateWithRetryAsync(remainingTries - 1);
        }
    }
}

app.MapHub<ChatSignalRHub>("/api/chathub");
app.Run();
