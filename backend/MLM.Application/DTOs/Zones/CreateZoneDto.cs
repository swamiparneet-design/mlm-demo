using MLM.Domain.Enums;

namespace MLM.Application.DTOs.Zones;

public class CreateZoneDto
{
    public string ZoneName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public decimal EntryAmount { get; set; }
    public bool RequiresNewInvestmentIfDirectEntry { get; set; }
    public PlacementStrategyType PlacementStrategyType { get; set; } = PlacementStrategyType.Sequential;
    public int? CapacityLimit { get; set; }
    public bool IsActive { get; set; } = true;
}
