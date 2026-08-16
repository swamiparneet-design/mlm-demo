using FluentValidation;
using MLM.Application.DTOs.Stages;

namespace MLM.Application.Validators.Stages;

public class UpdateStageValidator : AbstractValidator<UpdateStageDto>
{
    public UpdateStageValidator()
    {
        RuleFor(x => x.StageName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.SequenceOrder).GreaterThan(0);
        RuleFor(x => x.RequiredPlacementCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.RequiredReferralCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PayoutAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.RetentionPercentage).InclusiveBetween(0, 100);
    }
}
