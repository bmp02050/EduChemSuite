using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Models;

public class AuthenticateResponse
{
    public AuthenticateResponse()
    {
    }

    public AuthenticateResponse(UserModel user, string accessToken, String refreshToken)
    {
        Id = user.Id;
        FirstName = user.FirstName;
        LastName = user.LastName;
        Email = user.Email;
        AccountType = user.AccountType;
        PreferDarkMode = user.PreferDarkMode;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        Success = true;
    }

    public Guid? Id { get; set; }
    public String? FirstName { get; set; }
    public String? LastName { get; set; }
    public String? Email { get; set; }
    public AccountType? AccountType { get; set; }
    public String? AccessToken { get; set; }
    public String? RefreshToken { get; set; }
    public bool PreferDarkMode { get; set; }
    public Boolean Success { get; set; }
}