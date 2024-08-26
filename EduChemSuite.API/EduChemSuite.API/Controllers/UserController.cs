using AutoMapper;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserService userService,
        IMapper mapper,
        ITokenService tokenService,
        IEmailService emailService,
        ILogger<UserController> logger)
    {
        _userService = userService;
        _mapper = mapper;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    [Authorize(Policy = "IsElevatedUser")]
    [HttpPost("register")]
    public async Task<IActionResult> Create([FromBody] UserModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userModel = await _userService.Create(model, model.Password);

            var token = await _tokenService.GenerateRegistrationInvitationTokenAsync(userModel.Id);
            var confirmationLink = Url.Action("ConfirmEmail", "User", new { userId = userModel.Id, token }, Request.Scheme);
            if (confirmationLink is null)
                throw new Exception("Could not create confirmation link");
            
            await _emailService.SendEmailAsync(userModel.Email, "Confirm Email", confirmationLink);

            return Ok(userModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during user registration");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("{id}/token")]
    public async Task<IActionResult> GenerateNewRegistrationToken(Guid id)
    {
        try
        {
            var token = await _tokenService.GenerateRegistrationInvitationTokenAsync(id);
            var confirmationLink = Url.Action("ConfirmEmail", "User", new { userId = id, token }, Request.Scheme);
            var userModel = await _userService.GetById(id);
            
            await _emailService.SendEmailAsync(userModel.Email, "Confirm Email", confirmationLink);
            return Ok("Email verification resent");
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return BadRequest(new { message = e.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromBody] UserModel model, Guid id)
    {
        var userId = User.FindFirst("Id")?.Value;
        if (!string.IsNullOrEmpty(userId) && id != new Guid(userId))
            return Unauthorized("You are not authorized to update this user");

        if (model.Id == Guid.Empty)
            model.Id = id;

        try
        {
            var updatedUser = await _userService.Update(model, model.Password);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during user update");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        try
        {
            var user = await _userService.GetById(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching the user");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst("Id")?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found");

        try
        {
            var user = await _userService.GetById(new Guid(userId));
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching the current user");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Invalid confirmation link.");
        }

        try
        {
            var user = await _userService.GetById(new Guid(userId));
            if (user == null)
                return NotFound("User not found");

            var result = await _tokenService.ConfirmRegistrationAsync(user.Id, token);

            if (result)
            {
                user.VerifiedEmail = true;
                user.IsActive = true;
                await _userService.Update(user);

                return Ok("Email confirmed. You can now log in.");
            }

            return BadRequest("Email confirmation failed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during email confirmation");
            return BadRequest(new { message = ex.Message });
        }
    }
}
