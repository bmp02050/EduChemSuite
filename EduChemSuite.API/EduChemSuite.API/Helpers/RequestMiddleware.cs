namespace EduChemSuite.API.Helpers;

public class RequestMiddleware(RequestDelegate next, ILogger<RequestMiddleware> logger)
{
    private static readonly string[] BlockedPathSegments =
    [
        "/cgi-bin/", ":80",
        "/.git/", "/.env", "/.git", "/.svn",
        "/wp-admin", "/wp-login", "/wp-content", "/wp-includes", "/wordpress",
        "/config.php", "/admin.php", "/xmlrpc.php", "/wp-cron.php",
        "/phpmyadmin", "/pma/", "/myadmin",
        "/actuator", "/manager/", "/console/",
        "/v1/.env", "/api/.env", "/api/env",
        "/debug/", "/trace/", "/elmah.axd",
        "/server-status", "/server-info",
        "/.well-known/security.txt" // not malicious but not ours
    ];

    private static readonly string[] BlockedExtensions =
    [
        ".php", ".asp", ".aspx", ".jsp", ".cgi"
    ];

    public async Task Invoke(HttpContext context)
    {
        var path = context.Request.Path.Value;

        if (context.Request.Method == "CONNECT")
        {
            Block(context, "CONNECT method");
            return;
        }

        if (path != null)
        {
            var pathLower = path.ToLowerInvariant();

            foreach (var segment in BlockedPathSegments)
            {
                if (pathLower.Contains(segment))
                {
                    Block(context, "suspicious path");
                    return;
                }
            }

            // Block non-API script extensions (bots probing for PHP/ASP/JSP)
            foreach (var ext in BlockedExtensions)
            {
                if (pathLower.EndsWith(ext))
                {
                    Block(context, "blocked extension");
                    return;
                }
            }
        }

        await next(context);
    }

    private void Block(HttpContext context, string reason)
    {
        logger.LogDebug("Blocked {Reason}: {Method} {Path} from {RemoteIp}",
            reason, context.Request.Method, context.Request.Path.Value,
            context.Connection.RemoteIpAddress);

        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "text/plain";
        context.Response.WriteAsync("403 Forbidden");
    }
}
