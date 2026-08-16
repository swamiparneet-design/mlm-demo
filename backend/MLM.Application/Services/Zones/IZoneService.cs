using MLM.Application.DTOs.Zones;

namespace MLM.Application.Services.Zones;

public interface IZoneService
{
    Task<List<ZoneDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ZoneDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ZoneDto> CreateAsync(CreateZoneDto dto, CancellationToken cancellationToken = default);
    Task<ZoneDto> UpdateAsync(int id, UpdateZoneDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
