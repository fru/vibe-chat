namespace App.Data.Entities;

public class ChatRoom
{
    public int Id { get; set; }
    public string RoomName { get; set; } = string.Empty;

    public ICollection<ChatRoomUser> Users { get; set; } = new List<ChatRoomUser>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
