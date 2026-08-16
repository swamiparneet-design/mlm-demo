namespace MLM.Application.DTOs.Auth;

public class RegisterRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Optional - the email or mobile of the user who referred this registration.
    /// </summary>
    public string? ReferrerEmail { get; set; }
}
