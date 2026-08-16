namespace MLM.Domain.Enums;

/// <summary>
/// Identifies which IPlacementStrategy implementation should be used to place
/// new users joining a given zone. New strategies can be added here and
/// implemented as new IPlacementStrategy classes without touching existing code.
/// </summary>
public enum PlacementStrategyType
{
    Sequential = 0,
    CapacityBased = 1,
    BatchFill = 2
}
