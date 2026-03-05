using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EduChemSuite.API.Dao;

public interface ITokenRepository
{
    Task<AuthenticateResponse?> AuthenticateAsync(User user);
    Task<String> GenerateRegistrationInvitationTokenAsync(RegistrationInviteToken token);
    Task<Boolean> ConfirmRegistrationAsync(RegistrationInviteToken token);
    Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken);
    Task<Token?> GetTokenByRefreshTokenAsync(Guid userId, String refreshToken);
    Task<RegistrationInviteToken?> GetRegistrationToken(Guid userId, string token);
    Task<(string authToken, string refreshToken)> GetTokens(User user);
    Task<string> GeneratePasswordResetTokenAsync(PasswordResetToken token);
    Task<PasswordResetToken?> GetPasswordResetToken(Guid userId, string token);
    Task MarkPasswordResetTokenUsedAsync(PasswordResetToken token);
}

public class TokenRepository(Context context, IOptions<Jwt> jwtSettings) : ITokenRepository
{
    private readonly Jwt _jwt = jwtSettings.Value;

    public async Task<String> GenerateRegistrationInvitationTokenAsync(RegistrationInviteToken token)
    {
        var newToken = await context.RegistrationInviteTokens.AddAsync(token);
        await context.SaveChangesAsync();
        return newToken.Entity.Token;
    }

    public async Task<Token?> GetTokenByRefreshTokenAsync(Guid userId, String refreshToken)
    {
        return await context.Token.AsNoTracking().FirstOrDefaultAsync(
            x => x.UserId == userId && x.RefreshToken == refreshToken);
    }

    public async Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return null;

        var tokens = await GetTokens(user);

        return new AuthenticateResponse(new UserModel
        {
            Id = user.Id,
            Email = user.Email,
            AccountType = user.AccountType,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address1 = user.Address1,
            Password = null,
            City = user.City,
            State = user.State,
            Country = user.Country,
            Zip = user.Zip,
            Phone = user.Phone,
            PreferDarkMode = user.PreferDarkMode,
        }, tokens.authToken, tokens.refreshToken);
    }

    public async Task<RegistrationInviteToken?> GetRegistrationToken(Guid userId, string token)
    {
       return await context.RegistrationInviteTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Token == token);
    }

    public async Task<bool> ConfirmRegistrationAsync(RegistrationInviteToken token)
    {
        context.RegistrationInviteTokens.Update(token);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<AuthenticateResponse?> AuthenticateAsync(User user)
    {
        var tokens = await GetTokens(user);
        return new AuthenticateResponse(new UserModel()
        {
            Id = user.Id,
            Email = user.Email,
            AccountType = user.AccountType,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address1 = user.Address1,
            Password = null,
            City = user.City,
            State = user.State,
            Country = user.Country,
            Zip = user.Zip,
            Phone = user.Phone,
            PreferDarkMode = user.PreferDarkMode,
        }, tokens.authToken, tokens.refreshToken);
    }

    public async Task<(string authToken, string refreshToken)> GetTokens(User user)
    {
        if (_jwt.Key is null)
            throw new Exception("Missing JWT Key");
        if (user?.Email is null)
            throw new Exception("Email is null");

        var issuer = _jwt.Issuer;
        var audience = _jwt.Audience;
        var key = Encoding.ASCII.GetBytes(_jwt.Key);

        var schoolIds = await context.UserSchools
            .AsNoTracking()
            .Where(us => us.UserId == user.Id)
            .Select(us => us.SchoolId.ToString())
            .ToListAsync();
        var districtIds = await context.UserDistricts
            .AsNoTracking()
            .Where(ud => ud.UserId == user.Id)
            .Select(ud => ud.DistrictId.ToString())
            .ToListAsync();

        var claims = new List<Claim>
        {
            new("Id", user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.AccountType.ToString()),
            new("FirstName", user.FirstName),
            new("LastName", user.LastName),
            new("SchoolIds", string.Join(",", schoolIds)),
            new("DistrictIds", string.Join(",", districtIds)),
            new("PreferDarkMode", user.PreferDarkMode.ToString()),
        };

        var accessTokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(60),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var authToken = tokenHandler.WriteToken(tokenHandler.CreateToken(accessTokenDescriptor));
        // Nullify any existing refresh tokens for user
        await CancelRefreshTokens(user.Id);
        // Generating refresh token
        var refreshToken = GenerateRefreshToken();
        var refreshTokenModel = new Token()
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            Expiration = DateTime.UtcNow.AddDays(14),
            Expired = false,
            Id = default,
            CreatedAt = default,
            IsActive = true
        };
        await context.Token.AddAsync(refreshTokenModel);
        await context.SaveChangesAsync();

        return (authToken, refreshToken);
    }

    private async Task CancelRefreshTokens(Guid userId)
    {
        var userRefreshTokens = await context.Token
            .Where(x => x.UserId == userId && x.Expiration >= DateTime.UtcNow).ToListAsync();
        foreach (var token in userRefreshTokens)
        {
            token.Expired = true;
        }

        await context.SaveChangesAsync();
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task<string> GeneratePasswordResetTokenAsync(PasswordResetToken token)
    {
        var newToken = await context.PasswordResetTokens.AddAsync(token);
        await context.SaveChangesAsync();
        return newToken.Entity.Token;
    }

    public async Task<PasswordResetToken?> GetPasswordResetToken(Guid userId, string token)
    {
        return await context.PasswordResetTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Token == token && !t.Used);
    }

    public async Task MarkPasswordResetTokenUsedAsync(PasswordResetToken token)
    {
        token.Used = true;
        context.PasswordResetTokens.Update(token);
        await context.SaveChangesAsync();
    }
}