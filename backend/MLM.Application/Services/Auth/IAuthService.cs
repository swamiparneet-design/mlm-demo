using MLM.Application.DTOs.Auth;

namespace MLM.Application.Services.Auth;

public interface IAuthService
{
    Task<UserDtoLite> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<VerifyOtpResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Minimal projection returned right after registration (before the user logs in).
/// </summary>
public class UserDtoLite
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
