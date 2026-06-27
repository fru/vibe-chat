namespace App.Data.Entities;

public class ChatMessage
{
    public Guid Id { get; set; }
    public int RoomId { get; set; }
    public ChatRoom Room { get; set; } = null!;
    public string Username { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
