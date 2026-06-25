namespace App.Services;

public interface IOneSignalClient
{
    Task SendPushAsync(string externalUserId, string heading, string contents, string? groupId = null);
}
