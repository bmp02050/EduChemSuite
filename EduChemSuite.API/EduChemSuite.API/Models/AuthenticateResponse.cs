namespace EduChemSuite.API.Models;

public class AuthenticateResponse
{
    public AuthenticateResponse()
    {
    }

    public AuthenticateResponse(UserModel user, string accessToken, String refreshToken)
    {
        Id = user.Id;
        Email = user.Email;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        Success = true;
    }

    public Guid Id { get; set; }
    public String? Email { get; set; }
    public String? AccessToken { get; set; }
    public String? RefreshToken { get; set; }
    public Boolean Success { get; set; }
}