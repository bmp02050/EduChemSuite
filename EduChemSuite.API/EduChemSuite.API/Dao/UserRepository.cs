using System.Security.Cryptography;
using System.Text;
using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IUserRepository
{
    Task<User?> GetById(Guid id);
    Task<User?> GetByEmail(String email);
    Task<User> Create(User user, string password);
    Task<User> Update(User user, string? password = null);
    Task<IEnumerable<User>> ListByDistrict(Guid districtId);
    Task<IEnumerable<User>> ListBySchool(Guid schoolId);
    Task<bool> IsEmailInUse(string email);
    Task<User?> AddQuestionToUser(Question question);
}

public class UserRepository(Context context) : IUserRepository
{
    public async Task<User?> GetById(Guid id)
    {
        return await context.Users
            .Include(u => u.Exams)
            .Include(u => u.ExamResponses)
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
    public async Task<User?> GetByEmail(String email)
    {
        return await context.Users
            .Include(u => u.Exams)
            .Include(u => u.ExamResponses)
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .FirstOrDefaultAsync(u => u.Email == email);
    }
    public async Task<User> Create(User user, string password)
    {
        CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;
        user.VerifiedEmail = false;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<User> Update(User userParam, string? password = null)
    {
        var user = await GetById(userParam.Id);
        if (user == null)
            throw new Exception("User not found");

        if (!string.IsNullOrWhiteSpace(userParam.Email) && userParam.Email != user.Email)
        {
            if (await IsEmailInUse(userParam.Email))
                throw new Exception("Email is already in use");
            user.Email = userParam.Email;
        }

        foreach (var propertyInfo in userParam.GetType().GetProperties())
        {
            var newValue = propertyInfo.GetValue(userParam);
            var currentValue = propertyInfo.GetValue(user);

            if (newValue != null && !newValue.Equals(currentValue))
            {
                propertyInfo.SetValue(user, newValue);
            }
        }

        if (!string.IsNullOrWhiteSpace(password))
        {
            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
        }

        await context.SaveChangesAsync();
        return user;
    }

    public async Task<IEnumerable<User>> ListByDistrict(Guid districtId)
    {
        return await context.Users
            .Where(u => u.UserDistricts.Any(d => d.DistrictId == districtId))
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> ListBySchool(Guid schoolId)
    {
        return await context.Users
            .Where(u => u.UserSchools.Any(s => s.SchoolId == schoolId))
            .ToListAsync();
    }

    public async Task<bool> IsEmailInUse(string email)
    {
        return await context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<User?> AddQuestionToUser(Question question)
    {
        var user = await GetById(question.UserId);
        if (user == null)
            return null;

        user.Questions ??= new List<Question>();

        if (user.Questions.All(q => q.Id != question.Id))
            user.Questions.Add(question);

        await context.SaveChangesAsync();
        return user;
    }

    private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
}
