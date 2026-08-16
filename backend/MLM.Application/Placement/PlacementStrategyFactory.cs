using MLM.Domain.Enums;

namespace MLM.Application.Placement;

/// <summary>
/// Resolves the correct IPlacementStrategy for a zone. Every registered strategy
/// is injected via DI (IEnumerable&lt;IPlacementStrategy&gt;) so adding a new
/// strategy is just: implement the interface + register it in DI. No existing
/// code needs to change.
/// </summary>
public class PlacementStrategyFactory : IPlacementStrategyFactory
{
    private readonly Dictionary<PlacementStrategyType, IPlacementStrategy> _strategies;

    public PlacementStrategyFactory(IEnumerable<IPlacementStrategy> strategies)
    {
        _strategies = strategies.ToDictionary(s => s.StrategyType);
    }

    public IPlacementStrategy GetStrategy(PlacementStrategyType strategyType)
    {
        if (!_strategies.TryGetValue(strategyType, out var strategy))
        {
            throw new NotSupportedException(
                $"No IPlacementStrategy is registered for strategy type '{strategyType}'.");
        }

        return strategy;
    }
}
