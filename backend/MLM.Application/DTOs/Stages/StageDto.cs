namespace MLM.Application.DTOs.Stages;

public class StageDto
{
    public int Id { get; set; }
    public int ZoneId { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public int RequiredPlacementCount { get; set; }
    public int RequiredReferralCount { get; set; }
    public decimal PayoutAmount { get; set; }
    public decimal RetentionPercentage { get; set; }
    public string? ItemReward { get; set; }
    public bool IsActive { get; set; }
}
