using System.Net;
using System.Net.Mail;

namespace EduChemSuite.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService(IConfiguration configuration) : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpServer = configuration["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(configuration["EmailSettings:SmtpPort"]);
        var smtpUser = configuration["EmailSettings:SmtpUser"];
        var smtpPassword = configuration["EmailSettings:SmtpPassword"];
        var enableSsl = bool.Parse(configuration["EmailSettings:EnableSsl"]);

        using var smtpClient = new SmtpClient(smtpServer, smtpPort);
        smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPassword);
        smtpClient.EnableSsl = enableSsl;

        var mail = new MailMessage
        {
            From = new MailAddress(smtpUser, "EduChemSuite Registration Confirmation"),
            Subject = subject,
            Body = body
        };

        mail.To.Add(new MailAddress(to));

        await smtpClient.SendMailAsync(mail);
    }
}