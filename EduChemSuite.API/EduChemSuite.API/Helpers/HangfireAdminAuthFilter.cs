using System.Security.Claims;
using Hangfire.Dashboard;

namespace EduChemSuite.API.Helpers;

public class HangfireAdminAuthFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }
}
