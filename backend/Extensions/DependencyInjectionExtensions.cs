using App.BackgroundServices;
using App.Data;
using App.Hubs;
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

        services.AddHttpClient<IOneSignalClient, OneSignalClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.onesignal.com/");
        });

        services.AddSingleton<IDeliveryTracker, DeliveryTracker>();
        services.AddScoped<IMessageService, MessageService>();

        services.AddHostedService<BootRecoveryService>();
        services.AddHostedService<NotificationSweeper>();

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
                dbContext.Database.EnsureCreated();
                Console.WriteLine("Database initialization succeeded.");
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
