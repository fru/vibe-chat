using App.Data.Entities;

namespace App.Services;

public interface IMessageService
{
    Task<ChatMessage> SendMessageAsync(string roomName, string username, string content);
    Task<List<ChatMessage>> GetMessagesAsync(string roomName);
}
