using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Stages;
using MLM.Domain.Entities;

namespace MLM.Application.Services.Stages;

public class StageService : IStageService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public StageService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<StageDto>> GetAllAsync(int? zoneId, CancellationToken cancellationToken = default)
    {
        var query = _context.Stages.AsQueryable();
        if (zoneId.HasValue)
        {
            query = query.Where(s => s.ZoneId == zoneId.Value);
        }

        var stages = await query.OrderBy(s => s.ZoneId).ThenBy(s => s.SequenceOrder).ToListAsync(cancellationToken);
        return _mapper.Map<List<StageDto>>(stages);
    }

    public async Task<StageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var stage = await _context.Stages.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Stage), id);
        return _mapper.Map<StageDto>(stage);
    }

    public async Task<StageDto> CreateAsync(CreateStageDto dto, CancellationToken cancellationToken = default)
    {
        var zoneExists = await _context.Zones.AnyAsync(z => z.Id == dto.ZoneId, cancellationToken);
        if (!zoneExists)
        {
            throw new NotFoundException(nameof(Zone), dto.ZoneId);
        }

        var stage = new Stage
        {
            ZoneId = dto.ZoneId,
            StageName = dto.StageName,
            SequenceOrder = dto.SequenceOrder,
            RequiredPlacementCount = dto.RequiredPlacementCount,
            RequiredReferralCount = dto.RequiredReferralCount,
            PayoutAmount = dto.PayoutAmount,
            RetentionPercentage = dto.RetentionPercentage,
            ItemReward = dto.ItemReward,
            IsActive = dto.IsActive
        };
        _context.Stages.Add(stage);
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<StageDto>(stage);
    }

    public async Task<StageDto> UpdateAsync(int id, UpdateStageDto dto, CancellationToken cancellationToken = default)
    {
        var stage = await _context.Stages.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Stage), id);

        stage.StageName = dto.StageName;
        stage.SequenceOrder = dto.SequenceOrder;
        stage.RequiredPlacementCount = dto.RequiredPlacementCount;
        stage.RequiredReferralCount = dto.RequiredReferralCount;
        stage.PayoutAmount = dto.PayoutAmount;
        stage.RetentionPercentage = dto.RetentionPercentage;
        stage.ItemReward = dto.ItemReward;
        stage.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<StageDto>(stage);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var stage = await _context.Stages.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Stage), id);

        stage.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
