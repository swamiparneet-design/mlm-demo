namespace MLM.Application.DTOs.Zones;

public class ZoneDto
{
    public int Id { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public decimal EntryAmount { get; set; }
    public bool RequiresNewInvestmentIfDirectEntry { get; set; }
    public string PlacementStrategyType { get; set; } = string.Empty;
    public int? CapacityLimit { get; set; }
    public bool IsActive { get; set; }
}
