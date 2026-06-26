using App.Data;
using App.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace App.BackgroundServices;

// Notification logic disabled while synchronise logic is being built.
// public class BootRecoveryService : IHostedService
// {
//     private readonly IServiceProvider _services;
//     private readonly ILogger<BootRecoveryService> _logger;
//
//     public BootRecoveryService(IServiceProvider services, ILogger<BootRecoveryService> logger)
//     {
//         _services = services;
//         _logger = logger;
//     }
//
//     public async Task StartAsync(CancellationToken cancellationToken)
//     {
//         using var scope = _services.CreateScope();
//         var db = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
//         var oneSignal = scope.ServiceProvider.GetRequiredService<IOneSignalClient>();
//
//         var cutoff = DateTime.UtcNow.AddMinutes(-30);
//         var orphanedMessages = await db.Messages
//             .Where(m => !m.IsDelivered && !m.PushSent && m.Timestamp > cutoff)
//             .ToListAsync(cancellationToken);
//
//         if (orphanedMessages.Count == 0)
//         {
//             _logger.LogInformation("Boot recovery: no orphaned messages found.");
//             return;
//         }
//
//         _logger.LogWarning("Boot recovery: processing {Count} orphaned messages.", orphanedMessages.Count);
//
//         var groupedByUser = orphanedMessages.GroupBy(m => m.ReceiverId);
//         foreach (var group in groupedByUser)
//         {
//             await oneSignal.SendPushAsync(group.Key.ToString(), "New Message", "You have unread messages.");
//         }
//
//         foreach (var msg in orphanedMessages)
//         {
//             msg.PushSent = true;
//         }
//
//         await db.SaveChangesAsync(cancellationToken);
//     }
//
//     public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
// }
