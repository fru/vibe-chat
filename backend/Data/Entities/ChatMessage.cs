namespace App.Data.Entities;

public class ChatMessage
{
    public Guid Id { get; set; }
    public int RoomId { get; set; }
    public ChatRoom Room { get; set; } = null!;
    public string Username { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Unnormalized flag: true when all <see cref="ChatMessageNotified"/> rows
    /// for this message have <see cref="ChatMessageNotified.Received"/> = true.
    /// </summary>
    public bool ReceivedAll { get; set; }

    public ICollection<ChatMessageNotified> Notifications { get; set; } = new List<ChatMessageNotified>();
}
