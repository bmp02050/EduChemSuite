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
    Task<RegistrationInviteToken> GetRegistrationToken(Guid userId, string token);
    Task<(string authToken, string refreshToken)> GetTokens(User user);
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
        return await context.Token.FirstOrDefaultAsync(
            x => x.UserId == userId && x.RefreshToken == refreshToken);
    }

    public async Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken)
    {
        var user = await context.Users.FirstAsync(x => x.Id == userId);

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
        }, tokens.authToken, tokens.refreshToken);
    }

    public async Task<RegistrationInviteToken> GetRegistrationToken(Guid userId, string token)
    {
       var registrationInviteToken =
            await context.RegistrationInviteTokens.FirstAsync(x => x.UserId == userId && x.Token == token);
       if (registrationInviteToken == null)
           throw new KeyNotFoundException("Token not found");
       return registrationInviteToken;
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

        var claims = new List<Claim>
        {
            new("Id", user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, user.Id.ToString()),
            new(ClaimTypes.Role, user.AccountType.ToString()),
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
    
}