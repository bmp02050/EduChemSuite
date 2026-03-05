using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessageController(IMessageService messageService, ILogger<MessageController> logger) : Controller
{
    private Guid GetUserId() => User.GetUserId();

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var messages = await messageService.Send(GetUserId(), model);
            return Ok(messages);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending message");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        try
        {
            return Ok(await messageService.GetInbox(GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting inbox");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sent")]
    public async Task<IActionResult> GetSent()
    {
        try
        {
            return Ok(await messageService.GetSent(GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting sent messages");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("conversation/{id}")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        try
        {
            return Ok(await messageService.GetConversation(id, GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting conversation");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            return Ok(await messageService.GetUnreadCount(GetUserId()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting unread count");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        try
        {
            await messageService.MarkAsRead(id, GetUserId());
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error marking message as read");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("conversation/{id}/read")]
    public async Task<IActionResult> MarkConversationAsRead(Guid id)
    {
        try
        {
            await messageService.MarkConversationAsRead(id, GetUserId());
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error marking conversation as read");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await messageService.Delete(id, GetUserId());
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting message");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetMessageableUsers()
    {
        try
        {
            return Ok(await messageService.GetMessageableUsers(GetUserId(), User.GetAccountType()));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting messageable users");
            return BadRequest(new { message = ex.Message });
        }
    }
}
