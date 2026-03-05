using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IUserService
{
    Task<UserModel?> GetById(Guid id);
    Task<UserModel?> GetByEmail(string email);
    Task<UserModel> Create(UserModel user, string password);
    Task<UserModel> Update(UserModel user, string? password = null);
    Task<IEnumerable<UserModel>> ListAll();
    Task<IEnumerable<UserModel>> ListByDistrict(Guid districtId);
    Task<IEnumerable<UserModel>> ListBySchool(Guid schoolId);
    Task<UserModel?> AddQuestionToUser(QuestionModel question);
    Task ConfirmEmailVerification(Guid userId);
    Task<UserModel> UpdateAccountType(Guid userId, AccountType newType);
}

public class UserService(IUserRepository userRepository, IMapper mapper) : IUserService
{
    public async Task<UserModel?> GetById(Guid id)
    {
        var userEntity = await userRepository.GetById(id);
        if (userEntity is null)
            throw new KeyNotFoundException($"User with id {id} not found");

        return mapper.Map<UserModel>(userEntity);
    }

    public async Task<UserModel?> GetByEmail(string email)
    {
        var userEntity = await userRepository.GetByEmail(email);
        return userEntity is null ? null : mapper.Map<UserModel>(userEntity);
    }

    public async Task<UserModel> Create(UserModel user, string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new Exception("Password is required");

        if (await userRepository.IsEmailInUse(user.Email))
            throw new Exception("This email is already in use.");

        var userEntity = mapper.Map<User>(user);
        userEntity = await userRepository.Create(userEntity, password);
        
        return mapper.Map<UserModel>(userEntity);
    }

    public async Task<UserModel> Update(UserModel user, string? password = null)
    {
        var userEntity = mapper.Map<User>(user);
        userEntity = await userRepository.Update(userEntity, password);

        return mapper.Map<UserModel>(userEntity);
    }

    public async Task<IEnumerable<UserModel>> ListAll()
    {
        var users = await userRepository.ListAll();
        return mapper.Map<IEnumerable<UserModel>>(users);
    }

    public async Task<IEnumerable<UserModel>> ListByDistrict(Guid districtId)
    {
        var users = await userRepository.ListByDistrict(districtId);
        return mapper.Map<IEnumerable<UserModel>>(users);
    }

    public async Task<IEnumerable<UserModel>> ListBySchool(Guid schoolId)
    {
        var users = await userRepository.ListBySchool(schoolId);
        return mapper.Map<IEnumerable<UserModel>>(users);
    }

    public async Task ConfirmEmailVerification(Guid userId)
    {
        await userRepository.ConfirmEmailVerification(userId);
    }

    public async Task<UserModel?> AddQuestionToUser(QuestionModel questionModel)
    {
        var questionEntity = mapper.Map<Question>(questionModel);
        questionEntity.IsActive = true;
        questionEntity.CreatedAt = DateTime.Now;
        questionEntity.Id = Guid.NewGuid();

        var updatedUser = await userRepository.AddQuestionToUser(questionEntity);
        return mapper.Map<UserModel>(updatedUser);
    }

    public async Task<UserModel> UpdateAccountType(Guid userId, AccountType newType)
    {
        var userEntity = await userRepository.UpdateAccountType(userId, newType);
        return mapper.Map<UserModel>(userEntity);
    }
}
