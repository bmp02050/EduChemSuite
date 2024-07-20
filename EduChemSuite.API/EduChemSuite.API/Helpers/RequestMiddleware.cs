namespace EduChemSuite.API.Helpers;

public class RequestMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        if (context.Request.Path.Value != null && (
                context.Request.Path.Value.Contains("/cgi-bin/") ||
                context.Request.Path.Value.Contains(":80")))
        {
            // Return a forbidden response
            context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Please fuck right off trying to access things that aren't yours.");
        }
        if (context.Request.Method == "CONNECT")
        {
            // Return a 405 Method Not Allowed response for CONNECT requests
            context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Please fuck right off trying to use this as a gateway.");
            return;
        }

        // Pass the request to the next middleware
        await next(context);
    }
}