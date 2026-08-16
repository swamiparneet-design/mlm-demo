using FluentValidation;
using MLM.Application.DTOs.Zones;

namespace MLM.Application.Validators.Zones;

public class UpdateZoneValidator : AbstractValidator<UpdateZoneDto>
{
    public UpdateZoneValidator()
    {
        RuleFor(x => x.ZoneName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.SequenceOrder).GreaterThan(0);
        RuleFor(x => x.EntryAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PlacementStrategyType).IsInEnum();
    }
}
