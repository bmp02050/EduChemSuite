using System.Security.Claims;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IUserScopingService
{
    Task<IQueryable<User>> GetScopedUsersQuery(Guid callerId, AccountType callerRole, ClaimsPrincipal? principal = null);
    Task<bool> CanViewUser(Guid callerId, AccountType callerRole, Guid targetUserId, ClaimsPrincipal? principal = null);
    Task<List<Guid>> GetUserSchoolIds(Guid userId, ClaimsPrincipal? principal = null);
    Task<List<Guid>> GetUserDistrictIds(Guid userId, ClaimsPrincipal? principal = null);
}

public class UserScopingService(Context context) : IUserScopingService
{
    public async Task<IQueryable<User>> GetScopedUsersQuery(Guid callerId, AccountType callerRole, ClaimsPrincipal? principal = null)
    {
        IQueryable<User> query = context.Users.Where(u => u.IsActive);

        switch (callerRole)
        {
            case AccountType.Admin:
                // Admin sees all users — no filter
                break;

            case AccountType.AdminStaff:
                var districtIds = await GetUserDistrictIds(callerId, principal);
                if (districtIds.Count > 0)
                {
                    // Users in caller's districts OR in schools belonging to those districts
                    var schoolIdsInDistricts = context.Set<DistrictSchools>()
                        .Where(ds => districtIds.Contains(ds.DistrictId))
                        .Select(ds => ds.SchoolId);

                    query = query.Where(u =>
                        u.UserDistricts!.Any(ud => districtIds.Contains(ud.DistrictId)) ||
                        u.UserSchools!.Any(us => schoolIdsInDistricts.Contains(us.SchoolId)));
                }
                else
                {
                    // AdminStaff with no district assignments can only see themselves
                    query = query.Where(u => u.Id == callerId);
                }
                break;

            case AccountType.Staff:
                var staffSchoolIds = await GetUserSchoolIds(callerId, principal);
                if (staffSchoolIds.Count > 0)
                {
                    query = query.Where(u =>
                        u.UserSchools!.Any(us => staffSchoolIds.Contains(us.SchoolId)));
                }
                else
                {
                    query = query.Where(u => u.Id == callerId);
                }
                break;

            case AccountType.Student:
                var studentSchoolIds = await GetUserSchoolIds(callerId, principal);
                if (studentSchoolIds.Count > 0)
                {
                    // Students can only see non-student staff in their schools
                    query = query.Where(u =>
                        u.AccountType != AccountType.Student &&
                        u.UserSchools!.Any(us => studentSchoolIds.Contains(us.SchoolId)));
                }
                else
                {
                    query = query.Where(u => false); // No schools → no visible users
                }
                break;
        }

        return query;
    }

    public async Task<bool> CanViewUser(Guid callerId, AccountType callerRole, Guid targetUserId, ClaimsPrincipal? principal = null)
    {
        if (callerId == targetUserId) return true;
        if (callerRole == AccountType.Admin) return true;

        var scopedQuery = await GetScopedUsersQuery(callerId, callerRole, principal);
        return await scopedQuery.AnyAsync(u => u.Id == targetUserId);
    }

    public async Task<List<Guid>> GetUserSchoolIds(Guid userId, ClaimsPrincipal? principal = null)
    {
        var fromClaims = principal?.GetSchoolIds();
        if (fromClaims is { Count: > 0 }) return fromClaims;

        return await context.UserSchools
            .Where(us => us.UserId == userId)
            .Select(us => us.SchoolId)
            .ToListAsync();
    }

    public async Task<List<Guid>> GetUserDistrictIds(Guid userId, ClaimsPrincipal? principal = null)
    {
        var fromClaims = principal?.GetDistrictIds();
        if (fromClaims is { Count: > 0 }) return fromClaims;

        return await context.UserDistricts
            .Where(ud => ud.UserId == userId)
            .Select(ud => ud.DistrictId)
            .ToListAsync();
    }
}
