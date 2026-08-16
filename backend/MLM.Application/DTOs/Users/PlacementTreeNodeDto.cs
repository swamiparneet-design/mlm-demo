namespace MLM.Application.DTOs.Users;

public class PlacementTreeNodeDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime PlacedAt { get; set; }

    /// <summary>Current stage name within this zone, if the member has progress here yet.</summary>
    public string? StageName { get; set; }
    public List<PlacementTreeNodeDto> Children { get; set; } = new();
}
