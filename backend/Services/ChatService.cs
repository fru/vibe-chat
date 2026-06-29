using App.Data;
using App.Data.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace App.Services;

/// <summary>
/// Handles chat message persistence, unread-count bookkeeping, and the
/// SignalR notifications that flow from those mutations. Merging the former
/// MessageService and NotificationService keeps the data access and the
/// push notifications that depend on it in one place.
/// </summary>
public class ChatService
{
    private readonly ChatDbContext _db;
    private readonly IHubContext<ChatSignalRHub> _hubContext;
    private readonly ExpoPushService _pushService;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        ChatDbContext db,
        IHubContext<ChatSignalRHub> hubContext,
        ExpoPushService pushService,
        ILogger<ChatService> logger)
    {
        _db = db;
        _hubContext = hubContext;
        _pushService = pushService;
        _logger = logger;
    }

    public async Task<ChatMessage> SendMessageAsync(string roomName, string username, string content, Guid? clientId = null)
    {
        var room = await _db.ChatRooms.FirstOrDefaultAsync(r => r.RoomName == roomName)
            ?? throw new InvalidOperationException($"Room '{roomName}' not found.");

        var message = new ChatMessage
        {
            // Honor a client-supplied id so optimistic UI can reconcile by id.
            Id = clientId ?? Guid.NewGuid(),
            RoomId = room.Id,
            Username = username,
            Content = content,
            Timestamp = DateTime.UtcNow
        };

        await _db.ChatMessages.AddAsync(message);

        // Increment the unread count for every member of the room except the sender.
        var otherMembers = await _db.ChatRoomUsers
            .Where(u => u.RoomId == room.Id && u.Username != username)
            .ToListAsync();

        foreach (var member in otherMembers)
        {
            member.UnreadCount++;
        }

        await _db.SaveChangesAsync();

        // Fire a push notification (dummy: always goes to a fixed test token).
        // Awaiting is intentional for now so the dummy is easy to observe;
        // failures are swallowed inside ExpoPushService so chat is never blocked.
        try
        {
            await _pushService.SendTestNotificationAsync(
                title: $"New message in {roomName}",
                body: $"{username}: {content}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while sending Expo push notification.");
        }

        return message;
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(string roomName)
    {
        return await _db.ChatMessages
            .Where(m => m.Room.RoomName == roomName)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }

    public async Task<ChatMessage?> GetMessageAsync(string roomName, Guid id)
    {
        return await _db.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == id && m.Room.RoomName == roomName);
    }

    /// <summary>
    /// Returns false (without mutating state) if the user is not a member of the room.
    /// </summary>
    public async Task<bool> MarkRoomAsReadAsync(string roomName, string username)
    {
        var membership = await _db.ChatRoomUsers
            .FirstOrDefaultAsync(u => u.Room.RoomName == roomName && u.Username == username);

        if (membership is null) return false;

        membership.UnreadCount = 0;
        membership.LastReadTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<Dictionary<string, int>> GetUnreadCountsForUserAsync(string username)
    {
        return await _db.ChatRoomUsers
            .Where(u => u.Username == username)
            .Select(u => new { u.Room.RoomName, u.UnreadCount })
            .ToDictionaryAsync(x => x.RoomName, x => x.UnreadCount);
    }

    /// <summary>
    /// Pushes refreshed unread-count payloads to a user's SignalR group.
    /// </summary>
    public async Task NotifyUserCountsAsync(string userId)
    {
        var counts = await GetUnreadCountsForUserAsync(userId);
        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("MessageCounts", counts);
    }
}
