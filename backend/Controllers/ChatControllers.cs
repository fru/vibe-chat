using App.Data;
using App.Data.Entities;
using App.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace App.Controllers;

[ApiController]
[Route("api/rooms/{room}/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly MessageService _messageService;
    private readonly IHubContext<ChatSignalRHub> _hubContext;
    private readonly ChatDbContext _db;

    public MessagesController(
        MessageService messageService,
        IHubContext<ChatSignalRHub> hubContext,
        ChatDbContext db)
    {
        _messageService = messageService;
        _hubContext = hubContext;
        _db = db;
    }

    // GET api/rooms/{room}/messages
    [HttpGet]
    public async Task<ActionResult<List<ChatMessageDto>>> GetMessages(string room)
    {
        var messages = await _messageService.GetMessagesAsync(room);
        return Ok(messages.Select(ToDto));
    }

    // POST api/rooms/{room}/messages
    [HttpPost]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(string room, [FromBody] SendMessageRequest request)
    {
        var message = await _messageService.SendMessageAsync(room, request.Username, request.Content);
        var dto = ToDto(message);

        // Notify every member of this room with refreshed unread counts.
        var memberNames = await _db.ChatRoomUsers
            .Where(u => u.Room.RoomName == room)
            .Select(u => u.Username)
            .ToListAsync();

        foreach (var member in memberNames)
        {
            await ChatSignalRHub.NotifyUserCountsAsync(_hubContext, _messageService, member);
        }

        return CreatedAtAction(
            nameof(SendMessage),
            new { room, id = message.Id },
            dto);
    }

    private static ChatMessageDto ToDto(ChatMessage message) => new(
        message.Id,
        message.RoomId,
        message.Username,
        message.Content,
        message.Timestamp);
}

[ApiController]
[Route("api/rooms/{room}/read")]
public class ReadController : ControllerBase
{
    private readonly MessageService _messageService;
    private readonly IHubContext<ChatSignalRHub> _hubContext;

    public ReadController(MessageService messageService, IHubContext<ChatSignalRHub> hubContext)
    {
        _messageService = messageService;
        _hubContext = hubContext;
    }

    // POST api/rooms/{room}/read
    [HttpPost]
    public async Task<IActionResult> MarkRead(string room, [FromBody] MarkReadRequest request)
    {
        await _messageService.MarkRoomAsReadAsync(room, request.Username);
        await ChatSignalRHub.NotifyUserCountsAsync(_hubContext, _messageService, request.Username);
        return Ok(new { status = "read" });
    }
}

public record SendMessageRequest(string Username, string Content);

public record MarkReadRequest(string Username);

public record ChatMessageDto(Guid Id, int RoomId, string Username, string Content, DateTime Timestamp);
