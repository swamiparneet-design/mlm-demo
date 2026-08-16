using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MLM.Application.DTOs.Stages;
using MLM.Application.Services.Stages;
using MLM.Domain.Enums;

namespace MLM.API.Controllers.Admin;

[ApiController]
[Route("api/admin/stages")]
[Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.Admin)}")]
public class StagesController : ControllerBase
{
    private readonly IStageService _stageService;

    public StagesController(IStageService stageService)
    {
        _stageService = stageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? zoneId, CancellationToken cancellationToken)
    {
        return Ok(await _stageService.GetAllAsync(zoneId, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _stageService.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStageDto dto, CancellationToken cancellationToken)
    {
        var created = await _stageService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStageDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _stageService.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _stageService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
