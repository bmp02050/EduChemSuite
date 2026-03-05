namespace EduChemSuite.API.Models;

public class ApiResponse<T>(Boolean success, T? data)
{
    public T? Data { get; set; } = data;
    public Boolean Success { get; set; } = success;
    public String? ErrorMessage { get; set; }

    public ApiResponse(Boolean success, String errorMessage) : this(success, default(T))
    {
        ErrorMessage = errorMessage;
    }
}