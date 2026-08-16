using FluentValidation;
using MLM.Application.DTOs.Users;

namespace MLM.Application.Validators.Users;

public class UpdateMyProfileValidator : AbstractValidator<UpdateMyProfileDto>
{
    public UpdateMyProfileValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Mobile).NotEmpty().MaximumLength(20);
    }
}
