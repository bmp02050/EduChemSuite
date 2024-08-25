using System.Security.Claims;
using System.Text;
using EduChemSuite.API;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Serilog;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .Configure<Jwt>(builder.Configuration.GetSection("Jwt"))
    .AddScoped<Jwt>()
    .AddTransient<IEmailService, EmailService>()
    .AddTransient(typeof(IBaseService<>), typeof(BaseService<>))
    .AddTransient<IAnswerService, AnswerService>()
    .AddTransient<IDistrictService, DistrictService>()
    .AddTransient<IExamQuestionService, ExamQuestionService>()
    .AddTransient<IExamResponseService, ExamResponseService>()
    .AddTransient<IExamService, ExamService>()
    .AddTransient<IGradeService, GradeService>()
    .AddTransient<IImageTypeService, ImageTypeService>()
    .AddTransient<IQuestionService, QuestionService>()
    .AddTransient<IQuestionTagService, QuestionTagService>()
    .AddTransient<IQuestionTypeService, QuestionTypeService>()
    .AddTransient<ISchoolService, SchoolService>()
    .AddTransient<ITagService, TagService>()
    .AddTransient<ITokenService, TokenService>()
    .AddTransient<IUserSchoolService, UserSchoolService>()
    .AddTransient<IUserService, UserService>();
builder.Services.AddAuthorizationBuilder();
builder.Services.AddDbContext<Context>(options =>
    {
        options.UseNpgsql(builder.Configuration["ConnectionStrings:dev"]);
        options.UseLoggerFactory(LoggerFactory.Create(builder => builder.AddConsole()));
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
                    { Type: ClaimTypes.Role, Value: "IsAdminStaff" }
                )
            ));
        options.AddPolicy("IsElevatedUser", policy =>
            policy.RequireAssertion(context =>
                context.User.HasClaim(c => c is
                    { Type: ClaimTypes.Role, Value: "Admin" } or
                    { Type: ClaimTypes.Role, Value: "IsAdminStaff" }
                )
            ));
    });
builder.Services.AddControllers().AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore
);

builder.Host.UseSerilog((ctx, lc) =>
    lc.MinimumLevel.Information()
        .WriteTo.Console());

builder.Services.AddSwaggerGen().AddReverseProxy();
builder.Services.AddMvcCore();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", builder =>
    {
        builder.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Register AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowOrigin");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<RequestMiddleware>();
app.UseEndpoints(endpoints => endpoints.MapControllers());

using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<Context>();
if (db.Database.GetPendingMigrations().Any())
{
    db.Database.Migrate();
}

await app.RunAsync();