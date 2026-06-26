namespace App.Data.Entities;

public class ChatRoomUser
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public ChatRoom Room { get; set; } = null!;
    public string Username { get; set; } = string.Empty;

    public ICollection<ChatMessageNotified> Notifications { get; set; } = new List<ChatMessageNotified>();
}
