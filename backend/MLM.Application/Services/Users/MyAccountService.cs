using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Payouts;
using MLM.Application.DTOs.Users;

namespace MLM.Application.Services.Users;

public class MyAccountService : IMyAccountService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public MyAccountService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> GetMyProfileAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), currentUserId);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateMyProfileAsync(int currentUserId, UpdateMyProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), currentUserId);

        user.FullName = dto.FullName;
        user.Mobile = dto.Mobile;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<List<UserZoneProgressDto>> GetMyZoneProgressAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        var progress = await _context.UserZoneProgresses
            .Include(p => p.CurrentZone)
            .Include(p => p.CurrentStage)
            .Where(p => p.UserId == currentUserId)
            .OrderBy(p => p.CurrentZone.SequenceOrder)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<UserZoneProgressDto>>(progress);
    }

    public Task<PlacementTreeNodeDto?> GetMyPlacementTreeAsync(int currentUserId, int zoneId, CancellationToken cancellationToken = default)
    {
        // Root is always the caller's own id - a user can never request another
        // user's subtree through this endpoint.
        return PlacementTreeBuilder.BuildAsync(_context, currentUserId, zoneId, cancellationToken);
    }

    public async Task<List<UserReferralDto>> GetMyDirectReferralsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        var referrals = await (
            from r in _context.UserReferrals
            join u in _context.Users on r.UserId equals u.Id
            where r.ReferredByUserId == currentUserId
            orderby r.CreatedAt descending
            select new UserReferralDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                JoinedAt = r.CreatedAt
            }).ToListAsync(cancellationToken);

        return referrals;
    }

    public async Task<List<PayoutTransactionDto>> GetMyPayoutHistoryAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        var transactions = await _context.PayoutTransactions
            .Include(p => p.User)
            .Include(p => p.Zone)
            .Include(p => p.Stage)
            .Where(p => p.UserId == currentUserId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<PayoutTransactionDto>>(transactions);
    }
}
