using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EduChemSuite.API.Services;

public interface ITokenService
{
    Task<AuthenticateResponse?> AuthenticateAsync(AuthenticateModel model);
    Task<String> GenerateRegistrationInvitationTokenAsync(Guid userId);
    Task<Boolean> ConfirmRegistrationAsync(Guid userId, String token);
    Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken);
    Task<Boolean> IsRefreshTokenValidAsync(Guid userId, String token);
    Task<string> GeneratePasswordResetTokenAsync(Guid userId);
    Task<bool> ResetPasswordAsync(Guid userId, string token, string newPassword);
}

public class TokenService(
    ITokenRepository tokenRepository,
    IUserRepository userRepository,
    IMapper mapper,
    IOptions<Jwt> jwtSettings) : ITokenService
{
    private readonly Jwt _jwt = jwtSettings.Value;

    public async Task<String> GenerateRegistrationInvitationTokenAsync(Guid userId)
    {
        var tokenData = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenData);
        }

        var tokenString = Convert.ToBase64String(tokenData);
        var token = new RegistrationInviteToken()
        {
            UserId = userId,
            Token = tokenString,
            Expiration = DateTime.UtcNow.AddMinutes(10),
            Used = false
        };
        return await tokenRepository.GenerateRegistrationInvitationTokenAsync(token);
       
    }

    public async Task<Boolean> IsRefreshTokenValidAsync(Guid userId, String refreshToken)
    {
        var token = await tokenRepository.GetTokenByRefreshTokenAsync(userId, refreshToken);
        return token is not null && token.Expiration >= DateTime.UtcNow && !token.Expired;
    }
    public async Task<AuthenticateResponse?> RefreshTokenAsync(Guid userId, String refreshToken)
    {
        var user = await userRepository.GetById(userId);
        
        if (user is null)
            throw new KeyNotFoundException("User not found");

        if (!await IsRefreshTokenValidAsync(userId, refreshToken))
            throw new Exception("Refresh token has expired. Please log in again.");

        return await tokenRepository.RefreshTokenAsync(userId, refreshToken);
    }


    public async Task<bool> ConfirmRegistrationAsync(Guid userId, string token)
    {
        var existingToken =
            await tokenRepository.GetRegistrationToken(userId, token);
        if (existingToken is null)
            throw new KeyNotFoundException("Token not found");
        
        var now = DateTime.UtcNow;
        if (now <= existingToken?.Expiration)
        {
            existingToken.Used = true;
        }

        return existingToken != null && await tokenRepository.ConfirmRegistrationAsync(existingToken);
    }

    public async Task<AuthenticateResponse?> AuthenticateAsync(AuthenticateModel model)
    {
        if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
            throw new KeyNotFoundException("Email or password is required");

        var user = await userRepository.GetByEmail(model.Email);

        if (user == null)
            throw new KeyNotFoundException("User does not exist");
        
        if (!user.VerifiedEmail)
            throw new Exception("This user does not exist or is not verified");

        if (!VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
            throw new Exception("Passwords don't match");
        return await tokenRepository.AuthenticateAsync(mapper.Map<User>(user));
    }
  
    public async Task<string> GeneratePasswordResetTokenAsync(Guid userId)
    {
        var tokenData = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenData);
        }

        var tokenString = Convert.ToBase64String(tokenData);
        var token = new PasswordResetToken
        {
            UserId = userId,
            Token = tokenString,
            Expiration = DateTime.UtcNow.AddMinutes(30),
            Used = false
        };
        return await tokenRepository.GeneratePasswordResetTokenAsync(token);
    }

    public async Task<bool> ResetPasswordAsync(Guid userId, string token, string newPassword)
    {
        var resetToken = await tokenRepository.GetPasswordResetToken(userId, token);
        if (resetToken is null)
            throw new KeyNotFoundException("Invalid or already used reset token.");

        if (DateTime.UtcNow > resetToken.Expiration)
            throw new Exception("Reset token has expired.");

        await tokenRepository.MarkPasswordResetTokenUsedAsync(resetToken);

        var user = await userRepository.GetById(userId);
        if (user is null)
            throw new KeyNotFoundException("User not found.");

        await userRepository.Update(user, newPassword);
        return true;
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