using System.Security.Cryptography;
using System.Text;
using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IUserService
{
    Task<User> GetById(Guid id);
    Task<User> Create(User user, string password);
    Task<User> Update(User user, String? password = null);
}

public class UserService(Context context) : IUserService
{
    public async Task<User> GetById(Guid id)
    {
        return await context.Users.Where(x => x.Id == id)
            .Include(x => x.Exams)
            .Include(x => x.ExamResponses)
            .Include(x => x.AccountType)
            .Include(x => x.UserDistricts)
            .ThenInclude(x => x.District)
            .Include(x => x.UserSchools)
            .ThenInclude(x => x.School)
            .FirstAsync();
    }

    public async Task<User> Create(User user, string password)
    {
        // validation
        if (string.IsNullOrWhiteSpace(password))
            throw new Exception("Password is required");

        if (context.Users.Any(x => x.Email == user.Email || x.Email == user.Email))
            throw new Exception("This is unavailable. Please try a different username or email address.");

        user.VerifiedEmail = false;
        CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<User> Update(User userParam, string password = null)
    {
        var user = await GetById(userParam.Id);

        if (user == null)
            throw new Exception("User not found");

        // Update username if it has changed and is not already taken
        if (!string.IsNullOrWhiteSpace(userParam.Email) && userParam.Email != user.Email)
        {
            if (context.Users.Any(x => x.Email == userParam.Email))
                throw new Exception("Email " + userParam.Email + " is not valid");
            user.Email = userParam.Email;
        }

        // Use reflection to update properties dynamically
        foreach (var propertyInfo in userParam.GetType().GetProperties())
        {
            // Check if the property is not null
            var newValue = propertyInfo.GetValue(userParam);
            var currentValue = propertyInfo.GetValue(user);

            if (newValue != null && !newValue.Equals(currentValue))
            {
                propertyInfo.SetValue(user, newValue);
            }
        }

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(password))
        {
            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
        }

        await context.SaveChangesAsync();
        return user;
    }

    private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        if (password == null) throw new ArgumentNullException("password");
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
}