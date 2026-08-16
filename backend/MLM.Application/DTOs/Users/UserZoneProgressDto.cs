namespace MLM.Application.DTOs.Users;

public class UserZoneProgressDto
{
    public int Id { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int StageId { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int CurrentPlacementCount { get; set; }
    public int RequiredPlacementCount { get; set; }
    public int CurrentReferralCount { get; set; }
    public int RequiredReferralCount { get; set; }
    public decimal PayoutAmount { get; set; }
    public decimal RetentionPercentage { get; set; }
    public string? ItemReward { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
