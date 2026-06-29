using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace App.Services;

/// <summary>
/// Sends push notifications through Expo's push service.
///
/// This is a dummy/placeholder implementation: it always targets a single
/// hard-coded test push token. It will later be extended to resolve real
/// per-user tokens (e.g. from a device-token store).
/// </summary>
public class ExpoPushService
{
    private const string ExpoPushEndpoint = "https://exp.host/--/api/v2/push/send";

    // Fixed test token — will be replaced with real per-user tokens later.
    private const string TestPushToken = "ExponentPushToken[Gjw_mVJzrQW6feXlLjYEWz]";

    private static readonly HttpClient HttpClient = new HttpClient();
    private readonly ILogger<ExpoPushService> _logger;

    public ExpoPushService(ILogger<ExpoPushService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Sends a push notification to the hard-coded test token.
    /// Failures are logged but never thrown so chat delivery is not blocked.
    /// </summary>
    public async Task SendTestNotificationAsync(string title, string body)
    {
        var payload = new
        {
            to = TestPushToken,
            title = title,
            body = body,
            sound = "default"
        };

        try
        {
            using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            // Expo does not require an auth header for sends to your own project,
            // but it does require no compression and an Accept header.
            var request = new HttpRequestMessage(HttpMethod.Post, ExpoPushEndpoint)
            {
                Content = content
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip", 0));

            var response = await HttpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning(
                    "Expo push request failed with status {Status}: {Body}",
                    response.StatusCode, errorBody);
            }
        }
        catch (Exception ex)
        {
            // Never let push failures break chat message delivery.
            _logger.LogError(ex, "Failed to send Expo push notification.");
        }
    }
}
