using System.Security.Claims;
using MLM.Domain.Interfaces;
using MLM.Domain.Enums;

namespace MLM.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public int UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(value) || !int.TryParse(value, out var id))
            {
                throw new UnauthorizedAccessException("No authenticated user found on the current request.");
            }

            return id;
        }
    }

    public UserRole Role
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrEmpty(value) || !Enum.TryParse<UserRole>(value, out var role))
            {
                throw new UnauthorizedAccessException("No authenticated user role found on the current request.");
            }

            return role;
        }
    }
}
