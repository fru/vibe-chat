using App.Data;
using App.Data.Entities;
using App.Services;

namespace App.Extensions;

public static class EndpointExtensions
{
    public static WebApplication MapChatEndpoints(this WebApplication app)
    {
        app.MapGet("/", () => "C# Web API is running smoothly!");

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
            return Results.Created($"/api/rooms/{room}/messages/{message.Id}", message);
        });

        return app;
    }
}

public record SendMessageRequest(string Username, string Content);
