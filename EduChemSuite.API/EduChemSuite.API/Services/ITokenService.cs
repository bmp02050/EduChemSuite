using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EduChemSuite.API.Services;

public interface ITokenService
{
    Task<AuthenticateResponse?> AuthenticateAsync(AuthenticateModel model);
    Task<String> GenerateRegistrationInvitationTokenAsync(User user);
    Task<Boolean> ConfirmRegistrationAsync(Guid userId, String token);
    Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken);
}

public class TokenService(Context context, IOptions<Jwt> jwtSettings) : ITokenService
{
    private readonly Jwt _jwt = jwtSettings.Value;

    public async Task<String> GenerateRegistrationInvitationTokenAsync(User user)
    {
        var tokenData = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenData);
        }

        var tokenString = Convert.ToBase64String(tokenData);
        var token = new RegistrationInviteToken()
        {
            UserId = user.Id,
            Token = tokenString,
            Expiration = DateTime.UtcNow.AddMinutes(10),
            Used = false
        };
        var newToken = await context.RegistrationInviteTokens.AddAsync(token);
        await context.SaveChangesAsync();
        return newToken.Entity.Token;
    }

    public async Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken)
    {
        if (context.Users == null) throw new Exception("User Context is null.");

        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
            throw new Exception("Invalid user");

        var refreshTokenResponse =
            await context.TokenRepository.FirstOrDefaultAsync(
                x => x.UserId == userId && x.RefreshToken == refreshToken);

        if (refreshTokenResponse is null)
            throw new Exception("Cannot refresh token. Please log in again.");

        if (refreshTokenResponse.Expiration < DateTime.UtcNow || refreshTokenResponse.Expired)
            throw new Exception("Refresh token has expired. Please log in again.");

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


    public async Task<bool> ConfirmRegistrationAsync(Guid userId, string token)
    {
        var existingToken =
            await context.RegistrationInviteTokens.FirstOrDefaultAsync(x => x.UserId == userId && x.Token == token);
        var now = DateTime.UtcNow;
        if (now <= existingToken?.Expiration)
        {
            existingToken.Used = true;
            context.RegistrationInviteTokens.Update(existingToken);
            await context.SaveChangesAsync();
            return true;
        }

        return false;
    }

    public async Task<AuthenticateResponse?> AuthenticateAsync(AuthenticateModel model)
    {
        if ((string.IsNullOrEmpty(model.Email) && String.IsNullOrEmpty(model.Email)) ||
            string.IsNullOrEmpty(model.Password))
            return null;

        var user = await context.Users.FirstOrDefaultAsync(x => x.Email == model.Email);

        if (user == null)
            return null;

        if (!VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
            return null;

        if (!user.VerifiedEmail)
            throw new Exception("This user does not exist or is not verified");

        // authentication successful
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

    private async Task<(string authToken, string refreshToken)> GetTokens(User user)
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
        var refreshTokenModel = new TokenRepository
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            Expiration = DateTime.UtcNow.AddDays(14),
            Expired = false,
            Id = default,
            CreatedAt = default
        };
        await context.TokenRepository.AddAsync(refreshTokenModel);
        await context.SaveChangesAsync();

        return (authToken, refreshToken);
    }

    private async Task CancelRefreshTokens(Guid userId)
    {
        var userRefreshTokens = await context.TokenRepository
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

    private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        ArgumentNullException.ThrowIfNull(password);
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");
        if (storedHash.Length != 64)
            throw new ArgumentException("Invalid length of password hash (64 bytes expected).", "passwordHash");
        if (storedSalt.Length != 128)
            throw new ArgumentException("Invalid length of password salt (128 bytes expected).", "passwordHash");

        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return !computedHash.Where((t, i) => t != storedHash[i]).Any();
    }
}