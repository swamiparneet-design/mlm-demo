using MLM.Domain.Enums;

namespace MLM.Application.Placement;

public interface IPlacementStrategyFactory
{
    IPlacementStrategy GetStrategy(PlacementStrategyType strategyType);
}
