namespace MLM.Domain.Entities;

/// <summary>
/// Tracks direct referrals independently from tree placement position.
/// A user can only be referred once, so UserId is unique.
/// </summary>
public class UserReferral
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ReferredByUserId { get; set; }
    public User ReferredByUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
