using System.Security.Claims;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var userIdClaim = User.FindFirst("Id")?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return BadRequest("User ID not found");

            if (string.IsNullOrEmpty(roleClaim) || !Enum.TryParse<AccountType>(roleClaim, out var role))
                return BadRequest("User role not found");

            var dashboard = await dashboardService.GetDashboard(userId, role);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error building dashboard");
            return StatusCode(500, "Error loading dashboard");
        }
    }
}
