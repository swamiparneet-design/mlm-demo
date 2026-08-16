using FluentValidation;
using MLM.Application.DTOs.Auth;

namespace MLM.Application.Validators.Auth;

public class VerifyOtpRequestValidator : AbstractValidator<VerifyOtpRequestDto>
{
    public VerifyOtpRequestValidator()
    {
        RuleFor(x => x.Mobile).NotEmpty();
        RuleFor(x => x.Otp).NotEmpty().Length(6);
    }
}
