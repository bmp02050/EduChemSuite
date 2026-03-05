using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IUserRepository
{
    Task<User?> GetById(Guid id);
    Task<User?> GetByEmail(String email);
    Task<User> Create(User user, string password);
    Task<User> Update(User user, string? password = null);
    Task<IEnumerable<User>> ListAll();
    Task<IEnumerable<User>> ListByDistrict(Guid districtId);
    Task<IEnumerable<User>> ListBySchool(Guid schoolId);
    Task<bool> IsEmailInUse(string email);
    Task<User?> AddQuestionToUser(Question question);
    Task ConfirmEmailVerification(Guid userId);
    Task<User> UpdateAccountType(Guid userId, AccountType newType);
}

public class UserRepository(Context context) : IUserRepository
{
    public async Task<User?> GetById(Guid id)
    {
        return await context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.Exams)
            .Include(u => u.ExamResponses)
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts).ThenInclude(ud => ud.District)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
    public async Task<User?> GetByEmail(String email)
    {
        return await context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.Exams)
            .Include(u => u.ExamResponses)
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts).ThenInclude(ud => ud.District)
            .FirstOrDefaultAsync(u => u.Email == email);
    }
    public async Task<User> Create(User user, string password)
    {
        PasswordHelper.CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;
        user.VerifiedEmail = false;
        user.IsActive = true;

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

        user.FirstName = userParam.FirstName;
        user.LastName = userParam.LastName;
        user.Address1 = userParam.Address1;
        user.Address2 = userParam.Address2;
        user.Address3 = userParam.Address3;
        user.City = userParam.City;
        user.State = userParam.State;
        user.Country = userParam.Country;
        user.Zip = userParam.Zip;
        user.Phone = userParam.Phone;
        user.AccountType = userParam.AccountType;
        user.ShowEmail = userParam.ShowEmail;
        user.PreferDarkMode = userParam.PreferDarkMode;

        if (!string.IsNullOrWhiteSpace(password))
        {
            PasswordHelper.CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
        }

        await context.SaveChangesAsync();
        return user;
    }

    public async Task<IEnumerable<User>> ListAll()
    {
        return await context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Where(u => u.IsActive)
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts).ThenInclude(ud => ud.District)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> ListByDistrict(Guid districtId)
    {
        return await context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Where(u => u.UserDistricts.Any(d => d.DistrictId == districtId))
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts).ThenInclude(ud => ud.District)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> ListBySchool(Guid schoolId)
    {
        return await context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Where(u => u.UserSchools.Any(s => s.SchoolId == schoolId))
            .Include(u => u.UserSchools).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts).ThenInclude(ud => ud.District)
            .ToListAsync();
    }

    public async Task<bool> IsEmailInUse(string email)
    {
        return await context.Users.AsNoTracking().AnyAsync(u => u.Email == email);
    }

    public async Task<User?> AddQuestionToUser(Question question)
    {
        // Ensure we're working with a clean instance
        var user = await GetById(question.UserId);
        if (user == null)
            return null;

        // Initialize collection if needed
        user.Questions ??= new List<Question>();

        // Check if question already exists
        var existingQuestion = user.Questions.FirstOrDefault(q => q.Id == question.Id);
    
        if (existingQuestion == null)
        {
            // Check if the question is already tracked by the context
            var trackedQuestion = await context.Questions.FindAsync(question.Id);
        
            if (trackedQuestion != null)
            {
                // Use the tracked instance
                user.Questions.Add(trackedQuestion);
            }
            else
            {
                // If the question isn't tracked and doesn't exist, add it as a new entity
                // or attach it depending on your needs
                if (question.Id == default) // New question
                {
                    user.Questions.Add(question);
                }
                else // Existing question but not tracked
                {
                    context.Questions.Attach(question);
                    user.Questions.Add(question);
                }
            }
        }

        try
        {
            await context.SaveChangesAsync();
            return user;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Handle concurrency conflict
            foreach (var entry in ex.Entries)
            {
                if (entry.Entity is User)
                {
                    // Reload the user and retry
                    await entry.ReloadAsync();
                
                    // Option 1: Retry the operation
                    // return await AddQuestionToUser(question);
                
                    // Option 2: Log and return null
                    // Log the concurrency issue
                    return null;
                }
            }
            throw;
        }
    }

    public async Task ConfirmEmailVerification(Guid userId)
    {
        var user = await context.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        user.VerifiedEmail = true;
        user.IsActive = true;
        await context.SaveChangesAsync();
    }

    public async Task<User> UpdateAccountType(Guid userId, AccountType newType)
    {
        var user = await GetById(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        user.AccountType = newType;
        await context.SaveChangesAsync();
        return user;
    }

}
