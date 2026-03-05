using AutoMapper;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    ITokenService tokenService,
    IUserService userService,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<UserController> logger) : Controller
{
    private readonly string _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:4300";
    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<IActionResult> Authenticate([FromBody] AuthenticateModel model)
    {
        try
        {
            var response = await tokenService.AuthenticateAsync(model);
            if (response is null)
                return NotFound("User not found");
            return Ok(response);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Authentication failed");
            return BadRequest(new { message = "Invalid credentials" });
        }
    }
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await tokenService.RefreshTokenAsync(request.UserId, request.RefreshToken);
            if (response is null)
                return NotFound("User not found");
            return Ok(response);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Token refresh failed");
            return BadRequest(new { message = "Token refresh failed" });
        }
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
    {
        try
        {
            var user = await userService.GetByEmail(model.Email);
            if (user is not null)
            {
                var token = await tokenService.GeneratePasswordResetTokenAsync(user.Id);
                var resetLink =
                    $"{_frontendUrl}/account/reset-password?userId={user.Id}&token={Uri.EscapeDataString(token)}";
                await emailService.SendEmailAsync(user.Email, "Reset Your Password", resetLink);
            }

            // Always return OK to prevent email enumeration
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error during forgot-password");
            // Still return OK to prevent email enumeration
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }
    }

    [AllowAnonymous]
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordModel model)
    {
        try
        {
            var user = await userService.GetByEmail(model.Email);
            if (user is not null)
            {
                var token = await tokenService.GenerateRegistrationInvitationTokenAsync(user.Id);
                var confirmLink =
                    $"{_frontendUrl}/account/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";
                await emailService.SendEmailAsync(user.Email, "Confirm Email", confirmLink);
            }

            // Always return OK to prevent email enumeration
            return Ok(new { message = "If an account with that email exists, a verification email has been sent." });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error during resend-verification");
            // Still return OK to prevent email enumeration
            return Ok(new { message = "If an account with that email exists, a verification email has been sent." });
        }
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        try
        {
            var result = await tokenService.ResetPasswordAsync(model.UserId, model.Token, model.NewPassword);
            if (result)
                return Ok(new { message = "Password has been reset successfully." });

            return BadRequest(new { message = "Password reset failed." });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Password reset failed");
            return BadRequest(new { message = "Password reset failed. The link may have expired." });
        }
    }
}