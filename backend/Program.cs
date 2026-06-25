using App.Data;
using App.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddChatInfrastructure(builder.Configuration);

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

await app.Services.InitializeDatabaseAsync();

app.MapChatEndpoints();
app.MapHub<App.Hubs.ChatHub>("/chathub");

app.Run();
