using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Admin;
using MLM.Application.DTOs.Payouts;
using MLM.Application.DTOs.Users;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.Services.Users;

public class AdminUserService : IAdminUserService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AdminUserService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AdminUserSummaryDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.OrderByDescending(u => u.CreatedAt).ToListAsync(cancellationToken);

        var progressRows = await _context.UserZoneProgresses
            .Include(p => p.CurrentZone)
            .Include(p => p.CurrentStage)
            .ToListAsync(cancellationToken);

        var teamSizeByUser = await _context.PlacementClosures
            .GroupBy(c => c.AncestorUserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);

        var earnedByUser = await _context.PayoutTransactions
            .Where(p => p.Status == PayoutStatus.Completed)
            .GroupBy(p => p.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(p => p.NetPayoutAmount) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total, cancellationToken);

        var primaryProgressByUser = progressRows
            .GroupBy(p => p.UserId)
            .ToDictionary(
                g => g.Key,
                g => g
                    .OrderByDescending(p => p.Status == ProgressStatus.InProgress)
                    .ThenByDescending(p => p.CurrentZone.SequenceOrder)
                    .ThenByDescending(p => p.StartedAt)
                    .First());

        return users.Select(u =>
        {
            primaryProgressByUser.TryGetValue(u.Id, out var progress);

            return new AdminUserSummaryDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Mobile = u.Mobile,
                Role = u.Role.ToString(),
                KycStatus = u.KycStatus.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                CurrentZoneId = progress?.CurrentZoneId,
                CurrentZoneName = progress?.CurrentZone.ZoneName,
                CurrentStageName = progress?.CurrentStage.StageName,
                TeamSize = teamSizeByUser.GetValueOrDefault(u.Id),
                TotalEarned = earnedByUser.GetValueOrDefault(u.Id),
            };
        }).ToList();
    }

    public async Task<PlacementTreeNodeDto?> GetUserPlacementTreeAsync(int userId, int zoneId, CancellationToken cancellationToken = default)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new NotFoundException(nameof(Domain.Entities.User), userId);
        }

        return await PlacementTreeBuilder.BuildAsync(_context, userId, zoneId, cancellationToken);
    }

    public async Task<List<PayoutTransactionDto>> GetAllPayoutTransactionsAsync(CancellationToken cancellationToken = default)
    {
        var transactions = await _context.PayoutTransactions
            .Include(p => p.User)
            .Include(p => p.Zone)
            .Include(p => p.Stage)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<PayoutTransactionDto>>(transactions);
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalUsers = await _context.Users.CountAsync(u => u.Role == UserRole.User, cancellationToken);

        var totalCollections = await (
            from placement in _context.UserPlacements
            join zone in _context.Zones on placement.ZoneId equals zone.Id
            select zone.EntryAmount).SumAsync(cancellationToken);

        var totalPayouts = await _context.PayoutTransactions
            .Where(p => p.Status == PayoutStatus.Completed)
            .SumAsync(p => (decimal?)p.NetPayoutAmount, cancellationToken) ?? 0m;

        var totalRetained = await _context.PayoutTransactions
            .Where(p => p.Status == PayoutStatus.Completed)
            .SumAsync(p => (decimal?)p.RetentionAmount, cancellationToken) ?? 0m;

        return new DashboardSummaryDto
        {
            TotalUsers = totalUsers,
            TotalCollections = totalCollections,
            TotalPayouts = totalPayouts,
            TotalRetainedAmount = totalRetained
        };
    }
}
