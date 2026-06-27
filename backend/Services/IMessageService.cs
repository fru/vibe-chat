using App.Data.Entities;

namespace App.Services;

public interface IMessageService
{
    Task<ChatMessage> SendMessageAsync(string roomName, string username, string content);
    Task<List<ChatMessage>> GetMessagesAsync(string roomName);

    /// <summary>
    /// Marks all messages in the room as read for the given user: resets
    /// <see cref="ChatRoomUser.UnreadCount"/> to 0 and stamps <see cref="ChatRoomUser.LastReadTime"/>.
    /// </summary>
    Task MarkRoomAsReadAsync(string roomName, string username);

    /// <summary>
    /// Returns a map of room name -> unread message count for every room the user is a member of.
    /// Pushed over SignalR as the "missed messages" count.
    /// </summary>
    Task<Dictionary<string, int>> GetUnreadCountsForUserAsync(string username);
}
