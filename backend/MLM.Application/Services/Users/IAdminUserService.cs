using MLM.Application.DTOs.Admin;
using MLM.Application.DTOs.Payouts;
using MLM.Application.DTOs.Users;

namespace MLM.Application.Services.Users;

public interface IAdminUserService
{
    Task<List<AdminUserSummaryDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<PlacementTreeNodeDto?> GetUserPlacementTreeAsync(int userId, int zoneId, CancellationToken cancellationToken = default);
    Task<List<PayoutTransactionDto>> GetAllPayoutTransactionsAsync(CancellationToken cancellationToken = default);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
}
