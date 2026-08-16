using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Zones;
using MLM.Domain.Entities;

namespace MLM.Application.Services.Zones;

public class ZoneService : IZoneService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ZoneService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ZoneDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var zones = await _context.Zones
            .OrderBy(z => z.SequenceOrder)
            .ToListAsync(cancellationToken);
        return _mapper.Map<List<ZoneDto>>(zones);
    }

    public async Task<ZoneDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var zone = await _context.Zones.FirstOrDefaultAsync(z => z.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Zone), id);
        return _mapper.Map<ZoneDto>(zone);
    }

    public async Task<ZoneDto> CreateAsync(CreateZoneDto dto, CancellationToken cancellationToken = default)
    {
        var zone = new Zone
        {
            ZoneName = dto.ZoneName,
            SequenceOrder = dto.SequenceOrder,
            EntryAmount = dto.EntryAmount,
            RequiresNewInvestmentIfDirectEntry = dto.RequiresNewInvestmentIfDirectEntry,
            PlacementStrategyType = dto.PlacementStrategyType,
            CapacityLimit = dto.CapacityLimit,
            IsActive = dto.IsActive
        };
        _context.Zones.Add(zone);
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ZoneDto>(zone);
    }

    public async Task<ZoneDto> UpdateAsync(int id, UpdateZoneDto dto, CancellationToken cancellationToken = default)
    {
        var zone = await _context.Zones.FirstOrDefaultAsync(z => z.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Zone), id);

        zone.ZoneName = dto.ZoneName;
        zone.SequenceOrder = dto.SequenceOrder;
        zone.EntryAmount = dto.EntryAmount;
        zone.RequiresNewInvestmentIfDirectEntry = dto.RequiresNewInvestmentIfDirectEntry;
        zone.PlacementStrategyType = dto.PlacementStrategyType;
        zone.CapacityLimit = dto.CapacityLimit;
        zone.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ZoneDto>(zone);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var zone = await _context.Zones.FirstOrDefaultAsync(z => z.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Zone), id);

        zone.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
