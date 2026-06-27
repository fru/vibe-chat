using App;
using App.Data;
using App.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddSignalR();
builder.Services.AddScoped<MessageService>();

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

app.UseCors();

app.MapControllers();

// Run database migrations with retry on startup.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ChatDbContext>();

    int retryCount = 0;
    while (retryCount < 6)
    {
        try
        {
            await dbContext.Database.MigrateAsync();
            Console.WriteLine("Database migration succeeded.");
            break;
        }
        catch (Exception ex)
        {
            retryCount++;
            Console.WriteLine($"SQL Server is starting up... Retrying connection ({retryCount}/6)... Error: {ex.Message}");
            await Task.Delay(8000);
        }
    }
}

app.MapHub<ChatSignalRHub>("/chathub");

app.Run();
