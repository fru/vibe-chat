namespace App.Data.Entities;

public enum NotificationMethod
{
    Socket,
    Push
}

public class ChatMessageNotified
{
    public int Id { get; set; }
    public Guid MessageId { get; set; }
    public ChatMessage Message { get; set; } = null!;
    public int UserId { get; set; }
    public ChatRoomUser User { get; set; } = null!;
    public bool Received { get; set; }
    public NotificationMethod? Method { get; set; }
}
