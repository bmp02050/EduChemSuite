using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContactController(
    IEmailService emailService,
    ContactRateLimiter rateLimiter,
    IConfiguration configuration,
    ILogger<ContactController> logger) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] ContactModel model)
    {
        // Honeypot check — bots fill hidden fields, humans don't
        if (!string.IsNullOrEmpty(model.Website))
        {
            logger.LogInformation("Honeypot triggered from {RemoteIp}", HttpContext.Connection.RemoteIpAddress);
            return Ok(new { message = "Thank you for your message!" });
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        if (rateLimiter.IsRateLimited(ip))
        {
            logger.LogWarning("Contact rate limit exceeded for {RemoteIp}", ip);
            return StatusCode(429, new { message = "Too many requests. Please try again later." });
        }

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var adminEmail = configuration["ContactSettings:AdminEmail"]
                         ?? configuration["EmailSettings:SmtpUser"];

        if (string.IsNullOrEmpty(adminEmail))
        {
            logger.LogError("No admin email configured for contact form");
            return StatusCode(500, new { message = "Contact form is not configured." });
        }

        try
        {
            var subject = $"[EduChemSuite Contact] {model.SubjectType} — {model.Name}";
            var body = $"From: {model.Name} ({model.Email})\n" +
                       $"Subject Type: {model.SubjectType}\n\n" +
                       $"{model.Message}";

            await emailService.SendEmailAsync(adminEmail, subject, body);
            logger.LogInformation("Contact form submitted ({SubjectType})", model.SubjectType);
            return Ok(new { message = "Thank you for your message! We'll get back to you soon." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send contact form email");
            return StatusCode(500, new { message = "Failed to send message. Please try again later." });
        }
    }
}
