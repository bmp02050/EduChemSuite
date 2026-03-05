using System.Net;
using System.Net.Http.Headers;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class AuthControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var db = _factory.GetDbContext();
        var user = TestDataSeeder.CreateUser(db, "login-valid@test.com", "Password123!", AccountType.Admin);

        var response = await _client.PostAsync("/api/auth/authenticate",
            JsonBody(new { Email = "login-valid@test.com", Password = "Password123!" }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<AuthenticateResponse>(content);
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
    {
        var db = _factory.GetDbContext();
        TestDataSeeder.CreateUser(db, "login-invalid@test.com", "Password123!", AccountType.Admin);

        var response = await _client.PostAsync("/api/auth/authenticate",
            JsonBody(new { Email = "login-invalid@test.com", Password = "WrongPassword" }));

        // The controller catches the exception and returns BadRequest
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithNonexistentEmail_ReturnsNotFoundOrBadRequest()
    {
        var response = await _client.PostAsync("/api/auth/authenticate",
            JsonBody(new { Email = "nonexistent@test.com", Password = "Password123!" }));

        // The AuthController returns BadRequest when the TokenService throws a KeyNotFoundException
        // because the catch block catches all Exceptions and returns BadRequest(e.Message)
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithUnverifiedEmail_ReturnsBadRequest()
    {
        var db = _factory.GetDbContext();
        TestDataSeeder.CreateUser(db, "unverified@test.com", "Password123!", AccountType.Admin, verifiedEmail: false);

        var response = await _client.PostAsync("/api/auth/authenticate",
            JsonBody(new { Email = "unverified@test.com", Password = "Password123!" }));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsNewToken()
    {
        var db = _factory.GetDbContext();
        var user = TestDataSeeder.CreateUser(db, "refresh-valid@test.com", "Password123!", AccountType.Admin);

        // First authenticate to get a refresh token
        var authResponse = await _client.PostAsync("/api/auth/authenticate",
            JsonBody(new { Email = "refresh-valid@test.com", Password = "Password123!" }));
        var authContent = await authResponse.Content.ReadAsStringAsync();
        var authResult = JsonConvert.DeserializeObject<AuthenticateResponse>(authContent);

        var response = await _client.PostAsync("/api/auth/refresh-token",
            JsonBody(new { UserId = authResult!.Id, RefreshToken = authResult.RefreshToken }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<AuthenticateResponse>(content);
        result!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ForgotPassword_WithValidEmail_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        TestDataSeeder.CreateUser(db, "forgot-valid@test.com", "Password123!", AccountType.Admin);

        var response = await _client.PostAsync("/api/auth/forgot-password",
            JsonBody(new { Email = "forgot-valid@test.com" }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ForgotPassword_WithInvalidEmail_ReturnsOk()
    {
        // Should always return OK to prevent email enumeration
        var response = await _client.PostAsync("/api/auth/forgot-password",
            JsonBody(new { Email = "doesnotexist@test.com" }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ResetPassword_WithInvalidToken_ReturnsBadRequest()
    {
        var db = _factory.GetDbContext();
        var user = TestDataSeeder.CreateUser(db, "reset-invalid@test.com", "Password123!", AccountType.Admin);

        var response = await _client.PostAsync("/api/auth/reset-password",
            JsonBody(new { UserId = user.Id, Token = "invalid-token", NewPassword = "NewPass123!" }));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
