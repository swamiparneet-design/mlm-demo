using MLM.Application.DTOs.Payouts;
using MLM.Application.DTOs.Users;

namespace MLM.Application.Services.Users;

/// <summary>
/// Every method here is scoped to the caller's own data via the userId parameter,
/// which controllers must always source from JWT claims (ICurrentUserService),
/// never from request parameters. This is the enforcement point that guarantees
/// a user can only ever see their own profile/progress/downline/payouts.
/// </summary>
public interface IMyAccountService
{
    Task<UserDto> GetMyProfileAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateMyProfileAsync(int currentUserId, UpdateMyProfileDto dto, CancellationToken cancellationToken = default);
    Task<List<UserZoneProgressDto>> GetMyZoneProgressAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<PlacementTreeNodeDto?> GetMyPlacementTreeAsync(int currentUserId, int zoneId, CancellationToken cancellationToken = default);
    Task<List<UserReferralDto>> GetMyDirectReferralsAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<List<PayoutTransactionDto>> GetMyPayoutHistoryAsync(int currentUserId, CancellationToken cancellationToken = default);
}
