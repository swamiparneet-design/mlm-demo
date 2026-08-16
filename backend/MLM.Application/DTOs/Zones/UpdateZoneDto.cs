using MLM.Domain.Enums;

namespace MLM.Application.DTOs.Zones;

public class UpdateZoneDto
{
    public string ZoneName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public decimal EntryAmount { get; set; }
    public bool RequiresNewInvestmentIfDirectEntry { get; set; }
    public PlacementStrategyType PlacementStrategyType { get; set; }
    public int? CapacityLimit { get; set; }
    public bool IsActive { get; set; }
}
