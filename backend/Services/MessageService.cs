using App.Data;
using App.Data.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace App.Services;

public class MessageService : IMessageService
{
    private readonly ChatDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly IDeliveryTracker _deliveryTracker;
    private readonly IOneSignalClient _oneSignal;
    private readonly ILogger<MessageService> _logger;

    public MessageService(
        ChatDbContext db,
        IHubContext<ChatHub> hubContext,
        IDeliveryTracker deliveryTracker,
        IOneSignalClient oneSignal,
        ILogger<MessageService> logger)
    {
        _db = db;
        _hubContext = hubContext;
        _deliveryTracker = deliveryTracker;
        _oneSignal = oneSignal;
        _logger = logger;
    }

    public async Task SendMessageAsync(int senderId, int receiverId, string content)
    {
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Timestamp = DateTime.UtcNow,
            IsDelivered = false,
            IsRead = false,
            PushSent = false
        };

        await _db.Messages.AddAsync(message);
        await _db.SaveChangesAsync();

        _ = RouteMessageAndMonitorDeliveryAsync(message);
    }

    public async Task RouteMessageAndMonitorDeliveryAsync(Message message)
    {
        await _hubContext.Clients.Group($"User_{message.ReceiverId}")
            .SendAsync("ReceiveMessage", message);

        bool acknowledged = await _deliveryTracker.WaitForClientAckAsync(message.Id, TimeSpan.FromSeconds(2));

        if (acknowledged)
        {
            await MarkDeliveredAsync(message.Id);
            return;
        }

        var sender = await _db.Users.FindAsync(message.SenderId);
        await HandleNotificationFallbackAsync(message.ReceiverId, sender?.Username ?? "New Message", message.Content);
    }

    public async Task HandleNotificationFallbackAsync(int receiverId, string senderName, string content)
    {
        var log = await _db.PushNotificationLogs.FindAsync(receiverId);
        var now = DateTime.UtcNow;

        if (log is null || log.LastSentDateTime is null || (now - log.LastSentDateTime.Value).TotalSeconds > 60)
        {
            if (log is null)
            {
                _db.PushNotificationLogs.Add(new PushNotificationLog
                {
                    UserId = receiverId,
                    LastSentDateTime = now,
                    PendingCount = 0
                });
            }
            else
            {
                log.LastSentDateTime = now;
                log.PendingCount = 0;
            }
            await _db.SaveChangesAsync();

            await _oneSignal.SendPushAsync(receiverId.ToString(), senderName, content, $"Sender_{senderName}");
        }
        else
        {
            log.PendingCount += 1;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Buffered notification for user {ReceiverId}. Pending: {PendingCount}.", receiverId, log.PendingCount);
        }
    }

    public async Task MarkDeliveredAsync(int messageId)
    {
        var message = await _db.Messages.FindAsync(messageId);
        if (message is null || message.IsDelivered) return;

        message.IsDelivered = true;
        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"User_{message.SenderId}")
            .SendAsync("MessageDelivered", messageId);
    }

    public async Task MarkReadAsync(int messageId)
    {
        var message = await _db.Messages.FindAsync(messageId);
        if (message is null || message.IsRead) return;

        message.IsRead = true;
        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"User_{message.SenderId}")
            .SendAsync("MessageRead", messageId);
    }
}
