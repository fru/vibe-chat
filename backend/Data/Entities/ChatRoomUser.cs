namespace App.Data.Entities;

public class ChatRoomUser
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public ChatRoom Room { get; set; } = null!;
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Number of messages in this room that the user has not yet marked as read.
    /// </summary>
    public int UnreadCount { get; set; }

    /// <summary>
    /// Last time the user marked this room as read.
    /// </summary>
    public DateTime? LastReadTime { get; set; }

    /// <summary>
    /// Watermark for the last SignalR notification sent to this user for this room.
    /// Reserved for future dedup logic.
    /// </summary>
    public DateTime? CurrentSignalR { get; set; }

    /// <summary>
    /// Watermark for the last push notification sent to this user for this room.
    /// Reserved for future dedup logic.
    /// </summary>
    public DateTime? CurrentPushNotification { get; set; }
}
