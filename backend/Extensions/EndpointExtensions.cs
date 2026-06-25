using App.Data;
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

        app.MapPost("/api/messages", async (IMessageService messageService, SendMessageRequest request) =>
        {
            await messageService.SendMessageAsync(request.SenderId, request.ReceiverId, request.Content);
            return Results.Ok(new { status = "Sent" });
        });

        app.MapPost("/api/messages/{id:int}/read", async (IMessageService messageService, int id) =>
        {
            await messageService.MarkReadAsync(id);
            return Results.Ok();
        });

        return app;
    }
}

public record SendMessageRequest(int SenderId, int ReceiverId, string Content);
