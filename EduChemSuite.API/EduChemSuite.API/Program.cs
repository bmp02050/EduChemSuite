using System.Security.Claims;
using System.Text;
using EduChemSuite.API;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using EduChemSuite.API.Hubs;
using Microsoft.AspNetCore.HttpOverrides;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services
    .Configure<Jwt>(builder.Configuration.GetSection("Jwt"))
    .AddScoped<Jwt>()
    .AddTransient<IEmailService, EmailService>()
    // Repositories
    .AddTransient<IAnswerRepository, AnswerRepository>()
    .AddTransient<IDistrictRepository, DistrictRepository>()
    .AddTransient<IExamRepository, ExamRepository>()
    .AddTransient<IExamAssignmentRepository, ExamAssignmentRepository>()
    .AddTransient<IExamQuestionRepository, ExamQuestionRepository>()
    .AddTransient<IExamResponseRepository, ExamResponseRepository>()
    .AddTransient<IGradeRepository, GradeRepository>()
    .AddTransient<IImageTypeRepository, ImageTypeRepository>()
    .AddTransient<IQuestionRepository, QuestionRepository>()
    .AddTransient<IQuestionTagRepository, QuestionTagRepository>()
    .AddTransient<IQuestionTypeRepository, QuestionTypeRepository>()
    .AddTransient<ISchoolRepository, SchoolRepository>()
    .AddTransient<ITagRepository, TagRepository>()
    .AddTransient<ITokenRepository, TokenRepository>()
    .AddTransient<IUserRepository, UserRepository>()
    .AddTransient<IUserSchoolRepository, UserSchoolRepository>()
    .AddTransient<IMolecularStructureRepository, MolecularStructureRepository>()
    .AddTransient<ISearchRepository, SearchRepository>()
    .AddTransient<IMessageRepository, MessageRepository>()
    // Services
    .AddTransient<IAnswerService, AnswerService>()
    .AddTransient<IDistrictService, DistrictService>()
    .AddTransient<IExamService, ExamService>()
    .AddTransient<IExamAssignmentService, ExamAssignmentService>()
    .AddTransient<IExamQuestionService, ExamQuestionService>()
    .AddTransient<IExamResponseService, ExamResponseService>()
    .AddTransient<IGradeService, GradeService>()
    .AddTransient<IImageTypeService, ImageTypeService>()
    .AddTransient<IQuestionService, QuestionService>()
    .AddTransient<IQuestionTagService, QuestionTagService>()
    .AddTransient<IQuestionTypeService, QuestionTypeService>()
    .AddTransient<ISchoolService, SchoolService>()
    .AddTransient<ITagService, TagService>()
    .AddTransient<ITokenService, TokenService>()
    .AddTransient<IUserSchoolService, UserSchoolService>()
    .AddTransient<IUserService, UserService>()
    .AddTransient<IMolecularStructureService, MolecularStructureService>()
    .AddTransient<IDashboardService, DashboardService>()
    .AddTransient<IInviteService, InviteService>()
    .AddTransient<ISearchService, SearchService>()
    .AddTransient<IExportService, ExportService>()
    .AddTransient<IImportService, ImportService>()
    .AddTransient<IMessageService, MessageService>()
    .AddTransient<IExamGradingService, ExamGradingService>()
    .AddTransient<IUserScopingService, UserScopingService>()
    .AddSingleton<ContactRateLimiter>()
    .AddSingleton<AuthRateLimiter>();
builder.Services.AddAuthorizationBuilder();
builder.Services.AddDbContext<Context>(options =>
    {
        options.UseNpgsql(builder.Configuration["ConnectionStrings:dev"]);
    })
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer("Bearer", o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };
        // Allow SignalR to receive the JWT via query string
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    })
    .Services.AddAuthorization(options =>
    {
        options.AddPolicy("IsStaff", policy => policy.RequireRole("Staff"));
        options.AddPolicy("IsAdmin", policy => policy.RequireRole("Admin"));
        options.AddPolicy("IsStudent", policy => policy.RequireRole("Student"));
        options.AddPolicy("IsAdminStaff", policy => policy.RequireRole("AdminStaff"));
        options.AddPolicy("IsAdminOrStaff", policy =>
            policy.RequireAssertion(context =>
                context.User.HasClaim(c => c is
                    { Type: ClaimTypes.Role, Value: "Admin" } or
                    { Type: ClaimTypes.Role, Value: "Staff" } or
                    { Type: ClaimTypes.Role, Value: "AdminStaff" }
                )
            ));
        options.AddPolicy("IsElevatedUser", policy =>
            policy.RequireAssertion(context =>
                context.User.HasClaim(c => c is
                    { Type: ClaimTypes.Role, Value: "Admin" } or
                    { Type: ClaimTypes.Role, Value: "AdminStaff" }
                )
            ));
    });
builder.Services.AddControllers().AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore
);

builder.Host.UseSerilog((ctx, lc) =>
{
    lc.MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Hangfire", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("System.Net.Http.HttpClient", Serilog.Events.LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .WriteTo.Console();

    var seqUrl = ctx.Configuration["Seq:Url"];
    if (!string.IsNullOrEmpty(seqUrl))
        lc.WriteTo.Seq(seqUrl);
});

builder.Services.AddReverseProxy();
builder.Services.AddMvcCore();
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:4300";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", corsBuilder =>
    {
        corsBuilder.WithOrigins(frontendUrl, "http://localhost:4300")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSignalR();

// Hangfire background job processing
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(builder.Configuration["ConnectionStrings:dev"])));
builder.Services.AddHangfireServer();

// Health checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration["ConnectionStrings:dev"]!, name: "postgres");

// Register AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseSerilogRequestLogging(opts =>
{
    opts.GetLevel = (httpContext, elapsed, ex) =>
    {
        var path = httpContext.Request.Path;

        // Suppress successful health checks (Docker polls every 5s)
        if (path.StartsWithSegments("/health")
            && ex is null
            && httpContext.Response.StatusCode == 200)
            return Serilog.Events.LogEventLevel.Verbose;

        // Suppress Hangfire dashboard polling
        if (path.StartsWithSegments("/hangfire"))
            return Serilog.Events.LogEventLevel.Verbose;

        // Default: Error for 5xx/exceptions, Warning for 4xx, Information otherwise
        if (ex is not null || httpContext.Response.StatusCode >= 500)
            return Serilog.Events.LogEventLevel.Error;
        if (httpContext.Response.StatusCode >= 400)
            return Serilog.Events.LogEventLevel.Warning;

        return Serilog.Events.LogEventLevel.Information;
    };

    opts.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        var path = httpContext.Request.Path.Value ?? "";
        if (path.Contains("/token", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("/confirm", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("/reset", StringComparison.OrdinalIgnoreCase))
        {
            diagnosticContext.Set("RequestPath", path); // path only, no query string
        }
    };
});
app.UseCors("AllowOrigin");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<RequestMiddleware>();
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new HangfireAdminAuthFilter()]
});
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<MessageHub>("/hubs/messages");
    endpoints.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
    endpoints.MapHealthChecks("/health/ready");
});

using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<Context>();

// --migrate-only: apply migrations and exit (used by blue-green deploy script)
if (args.Contains("--migrate-only"))
{
    db.Database.Migrate();
    Log.Information("Migrations applied successfully. Exiting.");
    return;
}

if (Environment.GetEnvironmentVariable("SKIP_AUTO_MIGRATE") != "true"
    && !app.Environment.IsEnvironment("Testing")
    && db.Database.GetPendingMigrations().Any())
{
    db.Database.Migrate();
}

// Admin seed CLI command
if (args.Contains("--seed-admin"))
{
    Console.Write("Enter admin email: ");
    var email = Console.ReadLine()?.Trim();
    Console.Write("Enter admin password: ");
    var password = Console.ReadLine()?.Trim();

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        Console.WriteLine("Email and password are required.");
        return;
    }

    var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
    var adminUser = new EduChemSuite.API.Entities.User
    {
        Id = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow,
        FirstName = "Admin",
        LastName = "User",
        Email = email,
        AccountType = EduChemSuite.API.Entities.AccountType.Admin,
        VerifiedEmail = true,
        IsActive = true,
        Address1 = "",
        City = "",
        State = "",
        Country = "",
        Zip = "",
        Phone = "",
        PasswordHash = Array.Empty<byte>(),
        PasswordSalt = Array.Empty<byte>(),
    };
    await userRepo.Create(adminUser, password);
    Console.WriteLine($"Admin user '{email}' created successfully.");
    return;
}

if (!db.Users.Any())
{
    Log.Information("No users found. Run with --seed-admin to create the initial admin.");
}

await app.RunAsync();

public partial class Program { }