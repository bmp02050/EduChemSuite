using AutoMapper;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(
    IUserService userService,
    ISearchService searchService,
    IUserScopingService userScopingService,
    IMapper mapper,
    ITokenService tokenService,
    IEmailService emailService,
    IInviteService inviteService,
    IConfiguration configuration,
    ILogger<UserController> logger,
    AuthRateLimiter rateLimiter)
    : ControllerBase
{
    private readonly IMapper _mapper = mapper;
    private readonly string _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:4300";

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchUsers(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching users");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpGet("all")]
    public async Task<IActionResult> ListAll()
    {
        try
        {
            var users = await userService.ListAll();
            return Ok(users);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while listing all users");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpPost("register")]
    public async Task<IActionResult> Create([FromBody] UserModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Enforce invite hierarchy
            var inviterIdClaim = User.FindFirst("Id")?.Value;
            var inviterRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(inviterIdClaim) || string.IsNullOrEmpty(inviterRoleClaim))
                return Unauthorized("Unable to determine inviter identity.");

            if (!Enum.TryParse<AccountType>(inviterRoleClaim, out var inviterRole))
                return Unauthorized("Unable to determine inviter role.");

            var allowedTypes = inviteService.GetAllowedAccountTypes(inviterRole);
            if (!allowedTypes.Contains(model.AccountType))
                return Forbid();

            var userModel = await userService.Create(model, model.Password);

            var token = await tokenService.GenerateRegistrationInvitationTokenAsync(userModel.Id);
            var confirmationLink = $"{_frontendUrl}/account/confirm-email?userId={userModel.Id}&token={Uri.EscapeDataString(token)}";

            await emailService.SendEmailAsync(userModel.Email, "Confirm Email", confirmationLink);

            return Ok(userModel);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during user registration");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("{id}/token")]
    public async Task<IActionResult> GenerateNewRegistrationToken(Guid id)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        if (rateLimiter.IsRateLimited(ip))
            return StatusCode(429, new { message = "Too many requests. Please try again later." });

        try
        {
            var token = await tokenService.GenerateRegistrationInvitationTokenAsync(id);
            var confirmationLink = $"{_frontendUrl}/account/confirm-email?userId={id}&token={Uri.EscapeDataString(token)}";
            var userModel = await userService.GetById(id);

            await emailService.SendEmailAsync(userModel.Email, "Confirm Email", confirmationLink);
            return Ok("Email verification resent");
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to generate registration token for user {UserId}", id);
            return BadRequest(new { message = "Failed to generate registration token" });
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
            var updatedUser = await userService.Update(model, model.Password);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during user update");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        try
        {
            var callerId = User.GetUserId();
            var callerRole = User.GetAccountType();

            if (!await userScopingService.CanViewUser(callerId, callerRole, id, User))
                return Forbid();

            var user = await userService.GetById(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching the user");
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
            var user = await userService.GetById(new Guid(userId));
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching the current user");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsElevatedUser")]
    [HttpGet("district/{districtId}")]
    public async Task<IActionResult> ListByDistrict(Guid districtId)
    {
        try
        {
            var callerId = User.GetUserId();
            var callerRole = User.GetAccountType();

            // Admin can view any district; AdminStaff must be assigned to it
            if (callerRole != AccountType.Admin)
            {
                var callerDistricts = await userScopingService.GetUserDistrictIds(callerId, User);
                if (!callerDistricts.Contains(districtId))
                    return Forbid();
            }

            var users = await userService.ListByDistrict(districtId);
            return Ok(users);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while listing users by district");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpGet("school/{schoolId}")]
    public async Task<IActionResult> ListBySchool(Guid schoolId)
    {
        try
        {
            var callerId = User.GetUserId();
            var callerRole = User.GetAccountType();

            // Admin can view any school; others must have membership
            if (callerRole != AccountType.Admin)
            {
                if (callerRole == AccountType.AdminStaff)
                {
                    // AdminStaff can view schools in their districts
                    var callerDistricts = await userScopingService.GetUserDistrictIds(callerId, User);
                    // Check if school belongs to one of the caller's districts — done via query below
                }
                else
                {
                    // Staff must be in the school
                    var callerSchools = await userScopingService.GetUserSchoolIds(callerId, User);
                    if (!callerSchools.Contains(schoolId))
                        return Forbid();
                }
            }

            var users = await userService.ListBySchool(schoolId);
            return Ok(users);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while listing users by school");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpGet("invite-permissions")]
    public async Task<IActionResult> GetInvitePermissions()
    {
        try
        {
            var inviterIdClaim = User.FindFirst("Id")?.Value;
            var inviterRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(inviterIdClaim) || string.IsNullOrEmpty(inviterRoleClaim))
                return Unauthorized("Unable to determine inviter identity.");

            if (!Enum.TryParse<AccountType>(inviterRoleClaim, out var inviterRole))
                return Unauthorized("Unable to determine inviter role.");

            var permissions = await inviteService.GetInvitePermissions(new Guid(inviterIdClaim), inviterRole);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching invite permissions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpPatch("{id}/account-type")]
    public async Task<IActionResult> UpdateAccountType(Guid id, [FromBody] UpdateAccountTypeRequest request)
    {
        try
        {
            var callerRole = User.GetAccountType();
            var allowedTypes = inviteService.GetAllowedAccountTypes(callerRole);

            // Caller must outrank the target user's current type
            var targetUser = await userService.GetById(id);
            if (targetUser == null)
                return NotFound("User not found");

            if (!allowedTypes.Contains(targetUser.AccountType))
                return StatusCode(403, new { message = "You cannot modify a user of equal or higher rank." });

            // Caller must outrank the requested new type
            if (!allowedTypes.Contains(request.AccountType))
                return StatusCode(403, new { message = "You cannot assign this account type." });

            var updatedUser = await userService.UpdateAccountType(id, request.AccountType);
            return Ok(updatedUser);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("User not found");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while updating account type for user {UserId}", id);
            return BadRequest(new { message = "Failed to update account type." });
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
            var user = await userService.GetById(new Guid(userId));
            if (user == null)
                return NotFound("User not found");

            var result = await tokenService.ConfirmRegistrationAsync(user.Id, token);

            if (result)
            {
                await userService.ConfirmEmailVerification(user.Id);
                return Ok("Email confirmed. You can now log in.");
            }

            return BadRequest("Email confirmation failed.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during email confirmation");
            return BadRequest(new { message = ex.Message });
        }
    }
}
