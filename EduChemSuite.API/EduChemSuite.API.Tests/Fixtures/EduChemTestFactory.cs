using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EduChemSuite.API;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace EduChemSuite.API.Tests.Fixtures;

public class EduChemTestFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";

    public const string TestJwtKey = "SuperSecretTestKeyThatIsAtLeast64BytesLongForHmacSha512SigningAlgorithm!ExtraChars";
    public const string TestJwtIssuer = "TestIssuer";
    public const string TestJwtAudience = "TestAudience";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Inject JWT and connection string config BEFORE Program.cs reads them
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = TestJwtKey,
                ["Jwt:Issuer"] = TestJwtIssuer,
                ["Jwt:Audience"] = TestJwtAudience,
                ["ConnectionStrings:dev"] = "Host=localhost;Database=test",
                ["EmailSettings:SmtpServer"] = "localhost",
                ["EmailSettings:SmtpPort"] = "25",
                ["EmailSettings:SmtpUser"] = "test@test.com",
                ["EmailSettings:SmtpPassword"] = "test",
                ["EmailSettings:EnableSsl"] = "false",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<Context>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Remove the Context registration too
            var contextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(Context));
            if (contextDescriptor != null)
                services.Remove(contextDescriptor);

            // Add InMemory database
            services.AddDbContext<Context>(options =>
            {
                options.UseInMemoryDatabase(_dbName);
            });

            // Replace IEmailService with a no-op
            var emailDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IEmailService));
            if (emailDescriptor != null)
                services.Remove(emailDescriptor);
            services.AddTransient<IEmailService, NoOpEmailService>();
        });
    }

    public HttpClient CreateAuthenticatedClient(string role, Guid? userId = null)
    {
        var client = CreateClient();
        var token = GenerateJwtToken(role, userId ?? Guid.NewGuid());
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public static string GenerateJwtToken(string role, Guid userId, string email = "test@test.com")
    {
        var key = Encoding.ASCII.GetBytes(TestJwtKey);
        var claims = new List<Claim>
        {
            new("Id", userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, userId.ToString()),
            new(ClaimTypes.Role, role),
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = TestJwtIssuer,
            Audience = TestJwtAudience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
    }

    public Context GetDbContext()
    {
        var scope = Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<Context>();
    }
}

public class NoOpEmailService : IEmailService
{
    public Task SendEmailAsync(string to, string subject, string body) => Task.CompletedTask;
}
