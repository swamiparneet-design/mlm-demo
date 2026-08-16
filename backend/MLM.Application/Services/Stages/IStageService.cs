using MLM.Application.DTOs.Stages;

namespace MLM.Application.Services.Stages;

public interface IStageService
{
    Task<List<StageDto>> GetAllAsync(int? zoneId, CancellationToken cancellationToken = default);
    Task<StageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<StageDto> CreateAsync(CreateStageDto dto, CancellationToken cancellationToken = default);
    Task<StageDto> UpdateAsync(int id, UpdateStageDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
