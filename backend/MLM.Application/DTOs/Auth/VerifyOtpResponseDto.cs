namespace MLM.Application.DTOs.Auth;

public class VerifyOtpResponseDto
{
    public bool Verified { get; set; }
    public string Message { get; set; } = string.Empty;
}
