using System.Text;
using EduChemSuite.API;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .AddTransient<IEmailService, EmailService>()
    .AddTransient(typeof(IBaseService<>), typeof(BaseService<>))
    .AddTransient<IAccountTypeService, AccountTypeService>()
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
    .AddTransient<ITokenRepositoryService, TokenService>()
    .AddTransient<IUserDistrictService, UserDistrictService>()
    .AddTransient<IUserSchoolService, UserSchoolService>()
    .AddTransient<IUserService, UserService>();

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
    });
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
app.UseRateLimiter();
app.UseMiddleware<RequestMiddleware>();
app.UseEndpoints(endpoints => endpoints.MapControllers());
app.UseHttpsRedirection();


using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<Context>();
if (db.Database.GetPendingMigrations().Any())
{
    db.Database.Migrate();
}

await app.RunAsync();