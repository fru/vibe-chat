using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace App.Services;

public class OneSignalClient : IOneSignalClient
{
    private readonly HttpClient _httpClient;
    private readonly string _appId;
    private readonly ILogger<OneSignalClient> _logger;

    public OneSignalClient(HttpClient httpClient, IConfiguration configuration, ILogger<OneSignalClient> logger)
    {
        _httpClient = httpClient;
        _appId = configuration["OneSignal:AppId"] ?? throw new InvalidOperationException("OneSignal:AppId is not configured.");
        var restApiKey = configuration["OneSignal:RestApiKey"] ?? throw new InvalidOperationException("OneSignal:RestApiKey is not configured.");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", restApiKey);
        _logger = logger;
    }

    public async Task SendPushAsync(string externalUserId, string heading, string contents, string? groupId = null)
    {
        var payload = new
        {
            app_id = _appId,
            target_channel = "push",
            include_aliases = new { external_id = new[] { externalUserId } },
            headings = new { en = heading },
            contents = new { en = contents },
            thread_id = groupId,
            android_group = groupId
        };

        var json = JsonSerializer.Serialize(payload);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync("notifications?c=push", content);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OneSignal push to external user {ExternalUserId}.", externalUserId);
        }
    }
}
