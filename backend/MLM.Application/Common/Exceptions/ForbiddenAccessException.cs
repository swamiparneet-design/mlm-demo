namespace MLM.Application.Common.Exceptions;

/// <summary>
/// Thrown by the service layer whenever a user attempts to access data that does
/// not belong to them or their downline.
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("You do not have permission to access this resource.")
    {
    }

    public ForbiddenAccessException(string message) : base(message)
    {
    }
}
