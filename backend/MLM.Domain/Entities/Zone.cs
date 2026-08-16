using MLM.Domain.Enums;

namespace MLM.Domain.Entities;

/// <summary>
/// A Zone is fully admin-configurable at runtime - never hardcoded in application logic.
/// </summary>
public class Zone
{
    public int Id { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public decimal EntryAmount { get; set; }
    public bool RequiresNewInvestmentIfDirectEntry { get; set; }
    public PlacementStrategyType PlacementStrategyType { get; set; } = PlacementStrategyType.Sequential;

    /// <summary>
    /// Only meaningful for capacity-based / batch-fill strategies.
    /// </summary>
    public int? CapacityLimit { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Stage> Stages { get; set; } = new List<Stage>();
}
