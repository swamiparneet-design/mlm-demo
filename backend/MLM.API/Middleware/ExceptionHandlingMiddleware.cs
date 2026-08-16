using System.Net;
using System.Text.Json;
using FluentValidation;
using MLM.Application.Common.Exceptions;

namespace MLM.API.Middleware;

/// <summary>
/// Catches every unhandled exception and converts it into a clean, consistent
/// JSON error response instead of leaking stack traces to clients.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errors) = MapException(exception);

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception occurred.");
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var payload = new
        {
            status = (int)statusCode,
            message,
            errors
        };

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }

    private static (HttpStatusCode StatusCode, string Message, object? Errors) MapException(Exception exception)
    {
        return exception switch
        {
            NotFoundException notFound => (HttpStatusCode.NotFound, notFound.Message, null),
            ForbiddenAccessException forbidden => (HttpStatusCode.Forbidden, forbidden.Message, null),
            ConflictException conflict => (HttpStatusCode.Conflict, conflict.Message, null),
            UnauthorizedAccessException unauthorized => (HttpStatusCode.Unauthorized, unauthorized.Message, null),
            ValidationAppException validationApp => (HttpStatusCode.BadRequest, "Validation failed.", validationApp.Errors),
            ValidationException validation => (HttpStatusCode.BadRequest, "Validation failed.",
                validation.Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.", null)
        };
    }
}
