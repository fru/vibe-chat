using App.Services;
using Microsoft.AspNetCore.SignalR;

namespace App;

public class ChatSignalRHub : Hub
{
    private readonly MessageService _messageService;

    public ChatSignalRHub(MessageService messageService)
    {
        _messageService = messageService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            // Push the initial set of unread counts to the freshly connected client.
            await SendCountsToUserAsync(userId);
        }
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Broadcasts the current per-room unread counts to a single user.
    /// </summary>
    public async Task SendCountsToUserAsync(string userId)
    {
        var counts = await _messageService.GetUnreadCountsForUserAsync(userId);
        await Clients.Group($"User_{userId}")
            .SendAsync("MessageCounts", counts);
    }

    /// <summary>
    /// Broadcasts counts to a user from outside the hub (e.g. after a message is posted
    /// or a room is marked as read).
    /// </summary>
    public static async Task NotifyUserCountsAsync(IHubContext<ChatSignalRHub> hubContext, MessageService messageService, string userId)
    {
        var counts = await messageService.GetUnreadCountsForUserAsync(userId);
        await hubContext.Clients.Group($"User_{userId}")
            .SendAsync("MessageCounts", counts);
    }
}
