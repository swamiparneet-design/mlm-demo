using MLM.Domain.Enums;

namespace MLM.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Self-referencing FK: the user who referred this user onto the platform.
    /// Null for the first (root/SuperAdmin) user.
    /// </summary>
    public int? ReferrerUserId { get; set; }
    public User? Referrer { get; set; }
    public ICollection<User> DirectReferrals { get; set; } = new List<User>();

    public KycStatus KycStatus { get; set; } = KycStatus.Pending;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
