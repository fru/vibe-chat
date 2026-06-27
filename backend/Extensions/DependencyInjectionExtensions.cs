using App.Data;
using App.Services;
using Microsoft.EntityFrameworkCore;

namespace App.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddChatInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ChatDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddSignalR();
        services.AddScoped<MessageService>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ChatDbContext>();

        int retryCount = 0;
        while (retryCount < 6)
        {
            try
            {
                await dbContext.Database.MigrateAsync();
                Console.WriteLine("Database migration succeeded.");
                return;
            }
            catch (Exception ex)
            {
                retryCount++;
                Console.WriteLine($"SQL Server is starting up... Retrying connection ({retryCount}/6)... Error: {ex.Message}");
                await Task.Delay(8000);
            }
        }
    }
}
