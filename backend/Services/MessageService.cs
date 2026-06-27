using App.Data;
using App.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Services;

public class MessageService : IMessageService
{
    private readonly ChatDbContext _db;

    public MessageService(ChatDbContext db)
    {
        _db = db;
    }

    public async Task<ChatMessage> SendMessageAsync(string roomName, string username, string content)
    {
        var room = await _db.ChatRooms.FirstOrDefaultAsync(r => r.RoomName == roomName)
            ?? throw new InvalidOperationException($"Room '{roomName}' not found.");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
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

        return message;
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(string roomName)
    {
        return await _db.ChatMessages
            .Where(m => m.Room.RoomName == roomName)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }

    public async Task MarkRoomAsReadAsync(string roomName, string username)
    {
        var membership = await _db.ChatRoomUsers
            .FirstOrDefaultAsync(u => u.Room.RoomName == roomName && u.Username == username);

        if (membership is null)
        {
            return;
        }

        membership.UnreadCount = 0;
        membership.LastReadTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<Dictionary<string, int>> GetUnreadCountsForUserAsync(string username)
    {
        return await _db.ChatRoomUsers
            .Where(u => u.Username == username)
            .Select(u => new { u.Room.RoomName, u.UnreadCount })
            .ToDictionaryAsync(x => x.RoomName, x => x.UnreadCount);
    }
}
