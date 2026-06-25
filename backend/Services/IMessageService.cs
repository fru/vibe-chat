using App.Data.Entities;

namespace App.Services;

public interface IMessageService
{
    Task SendMessageAsync(int senderId, int receiverId, string content);
    Task HandleNotificationFallbackAsync(int receiverId, string senderName, string content);
    Task MarkDeliveredAsync(int messageId);
    Task MarkReadAsync(int messageId);
}
