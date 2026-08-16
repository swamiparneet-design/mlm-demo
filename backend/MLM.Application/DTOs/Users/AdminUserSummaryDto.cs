namespace MLM.Application.DTOs.Users;

/// <summary>
/// Enriched user row for the admin users table and reporting: augments the base
/// user record with their most-advanced zone/stage, downline size and lifetime
/// earnings so admins don't need to open every user individually to see this.
/// </summary>
public class AdminUserSummaryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string KycStatus { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public int? CurrentZoneId { get; set; }
    public string? CurrentZoneName { get; set; }
    public string? CurrentStageName { get; set; }
    public int TeamSize { get; set; }
    public decimal TotalEarned { get; set; }
}
