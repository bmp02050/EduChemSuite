using System.Security.Claims;
using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Helpers;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst("Id")?.Value;
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid user identity");
        return userId;
    }

    public static AccountType GetAccountType(this ClaimsPrincipal user)
    {
        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(roleClaim) || !Enum.TryParse<AccountType>(roleClaim, out var accountType))
            throw new UnauthorizedAccessException("Invalid user role");
        return accountType;
    }

    public static List<Guid> GetSchoolIds(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("SchoolIds")?.Value;
        if (string.IsNullOrEmpty(claim)) return [];
        return claim.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Where(s => Guid.TryParse(s, out _))
            .Select(Guid.Parse)
            .ToList();
    }

    public static List<Guid> GetDistrictIds(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("DistrictIds")?.Value;
        if (string.IsNullOrEmpty(claim)) return [];
        return claim.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Where(s => Guid.TryParse(s, out _))
            .Select(Guid.Parse)
            .ToList();
    }

    public static string? GetFirstName(this ClaimsPrincipal user)
        => user.FindFirst("FirstName")?.Value;

    public static string? GetLastName(this ClaimsPrincipal user)
        => user.FindFirst("LastName")?.Value;
}
