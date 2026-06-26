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
            Timestamp = DateTime.UtcNow,
            ReceivedAll = false
        };

        await _db.ChatMessages.AddAsync(message);
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
}
