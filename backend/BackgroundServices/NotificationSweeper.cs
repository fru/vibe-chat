using App.Data;
using App.Services;
using Microsoft.EntityFrameworkCore;

namespace App.BackgroundServices;

// Notification logic disabled while synchronise logic is being built.
// public class NotificationSweeper : BackgroundService
// {
//     private readonly IServiceProvider _services;
//     private readonly ILogger<NotificationSweeper> _logger;
//
//     public NotificationSweeper(IServiceProvider services, ILogger<NotificationSweeper> logger)
//     {
//         _services = services;
//         _logger = logger;
//     }
//
//     protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//     {
//         while (!stoppingToken.IsCancellationRequested)
//         {
//             try
//             {
//                 using var scope = _services.CreateScope();
//                 var db = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
//                 var oneSignal = scope.ServiceProvider.GetRequiredService<IOneSignalClient>();
//
//                 var cutoffTime = DateTime.UtcNow.AddSeconds(-5);
//                 var undeliveredMessages = await db.Messages
//                     .Where(m => !m.IsDelivered && !m.PushSent && m.Timestamp < cutoffTime)
//                     .ToListAsync(stoppingToken);
//
//                 if (undeliveredMessages.Count != 0)
//                 {
//                     foreach (var msg in undeliveredMessages)
//                     {
//                         var sender = await db.Users.FindAsync(msg.SenderId);
//                         await oneSignal.SendPushAsync(
//                             msg.ReceiverId.ToString(),
//                             sender?.Username ?? "New Message",
//                             msg.Content,
//                             $"Sender_{msg.SenderId}");
//                         msg.PushSent = true;
//                     }
//
//                     await db.SaveChangesAsync(stoppingToken);
//                 }
//             }
//             catch (Exception ex) when (ex is not OperationCanceledException)
//             {
//                 _logger.LogError(ex, "NotificationSweeper iteration failed.");
//             }
//
//             await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);
//         }
//     }
// }
