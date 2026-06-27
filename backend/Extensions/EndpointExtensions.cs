using App.Data;
using App.Data.Entities;
using App.Services;
using System.Runtime.InteropServices;

namespace App.Extensions;

public static class EndpointExtensions
{
    public static WebApplication MapChatEndpoints(this WebApplication app)
    {
        app.MapGet("/", () => "C# Web API is running smoothly!");

        // GET version metadata baked into the image at build time
        app.MapGet("/api/version.json", () => Results.Ok(new
        {
            version = Environment.GetEnvironmentVariable("APP_VERSION") ?? "dev",
            commitSha = Environment.GetEnvironmentVariable("APP_COMMIT_SHA") ?? "local",
            runtime = RuntimeInformation.FrameworkDescription
        }));

        app.MapGet("/test-db", async (ChatDbContext db) =>
        {
            try
            {
                var canConnect = await db.Database.CanConnectAsync();
                return canConnect
                    ? Results.Ok(new { status = "Success", message = "Connected to SQL Server successfully from C#!" })
                    : Results.Problem("Unable to reach SQL Server.");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database Exception: {ex.Message}");
            }
        });

        // GET chat messages for a room (called when first visiting the chat component)
        app.MapGet("/api/rooms/{room}/messages", async (IMessageService messageService, string room) =>
        {
            var messages = await messageService.GetMessagesAsync(room);
            return Results.Ok(messages);
        });

        // POST a new chat message to a room
        app.MapPost("/api/rooms/{room}/messages", async (IMessageService messageService, string room, SendMessageRequest request) =>
        {
            var message = await messageService.SendMessageAsync(room, request.Username, request.Content);
            var dto = new ChatMessageDto(
                message.Id,
                message.RoomId,
                message.Username,
                message.Content,
                message.Timestamp,
                message.ReceivedAll);
            return Results.Created($"/api/rooms/{room}/messages/{message.Id}", dto);
        });

        return app;
    }
}

public record SendMessageRequest(string Username, string Content);

public record ChatMessageDto(Guid Id, int RoomId, string Username, string Content, DateTime Timestamp, bool ReceivedAll);
