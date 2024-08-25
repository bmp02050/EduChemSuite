using AutoMapper;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ITokenService tokenService, ILogger<UserController> logger) : Controller
{
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
            logger.LogError(e, message: e?.Message);
            return BadRequest(e.Message);
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
            logger.LogError(e, message: e?.Message);
            return BadRequest(e.Message);
        }
    }
}