using AutoMapper;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(
    IUserService userService,
    IMapper mapper,
    ITokenRepositoryService tokenService,
    IEmailService emailService,
    ILogger<UserController> logger) : Controller
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserModel model)
    {
        // map model to entity
        var user = mapper.Map<User>(model);

        try
        {
            // create user
            var result = await userService.Create(user, model.Password);

            var token = await tokenService.GenerateRegistrationInvitationTokenAsync(result);
            var confirmationLink =
                Url.Action("ConfirmEmail", "Users", new { userId = result.Id, token }, Request.Scheme);

            await emailService.SendEmailAsync(result.Email, "Confirm Email", confirmationLink);

            return Ok(mapper.Map<UserModel>(result));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during user registration");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }

    [AllowAnonymous]
    [HttpGet("{id}/token")]
    public async Task<IActionResult> GenerateNewRegistrationToken(Guid id)
    {
        try
        {
            var user = await userService.GetById(id);

            var token = await tokenService.GenerateRegistrationInvitationTokenAsync(user);
            var confirmationLink =
                Url.Action("ConfirmEmail", "Users", new { userId = user.Id, token }, Request.Scheme);

            await emailService.SendEmailAsync(user.Email, "Confirm Email", confirmationLink);
            return Ok("Email verification resent");
        }
        catch (Exception e)
        {
            logger.LogError(e, message: e?.Message);
            return BadRequest(e.ToString());
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromBody] UserModel model, Guid id)
    {
        var userId = User.FindFirst("Id")?.Value;
        if (!String.IsNullOrEmpty(userId) && id != new Guid(userId))
            throw new UnauthorizedAccessException("You are not this person or the ID is missing");
        if (model.Id == Guid.Empty)
            model.Id = id;
        // map model to entity and set id
        var user = mapper.Map<User>(model);

        try
        {
            // update user 
            return Ok(mapper.Map<UserModel>(
                await userService.Update(user, model.Password)));
        }
        catch (Exception ex)
        {
            // return error message if there was an exception
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        try
        {
            // update user 
            return Ok(await userService.GetById(id));
        }
        catch (Exception ex)
        {
            // return error message if there was an exception
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    [Authorize]
    [HttpGet]
    [Route("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst("Id")?.Value;
        if (String.IsNullOrEmpty(userId))
            return BadRequest("UserID is not found");

        var user = await userService.GetById(new Guid(userId));
        var userModel = mapper.Map<UserModel>(user);
        return Ok(userModel);
    }

    [AllowAnonymous]
    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        if (userId == null || token == null)
        {
            return BadRequest("Invalid confirmation link.");
        }

        var user = await userService.GetById(new Guid(userId));
        var result = await tokenService.ConfirmRegistrationAsync(user.Id, token);

        if (result)
        {
            // Email confirmed successfully
            user.VerifiedEmail = result;
            await userService.Update(user);
            return Ok("Email confirmed. You can now log in.");
        }

        // Handle confirmation failure
        return BadRequest("Email confirmation failed.");
    }
}