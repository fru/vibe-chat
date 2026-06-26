using App.Services;
using Microsoft.AspNetCore.SignalR;

namespace App.Hubs;

public class ChatHub : Hub
{
    // Notification logic disabled while synchronise logic is being built.
    // private readonly IDeliveryTracker _deliveryTracker;
    //
    // public ChatHub(IDeliveryTracker deliveryTracker)
    // {
    //     _deliveryTracker = deliveryTracker;
    // }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"];
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        await base.OnConnectedAsync();
    }

    // public async Task AcknowledgeReceipt(int messageId)
    // {
    //     _deliveryTracker.Complete(messageId);
    //     await Clients.Caller.SendAsync("AckReceived", messageId);
    // }
}
