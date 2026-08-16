using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MLM.Application.Services.Users;
using MLM.Domain.Enums;

namespace MLM.API.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.Admin)}")]
public class AdminController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        return Ok(await _adminUserService.GetAllUsersAsync(cancellationToken));
    }

    [HttpGet("users/{userId:int}/placement-tree")]
    public async Task<IActionResult> GetUserPlacementTree(int userId, [FromQuery] int zoneId, CancellationToken cancellationToken)
    {
        var tree = await _adminUserService.GetUserPlacementTreeAsync(userId, zoneId, cancellationToken);
        return Ok(tree);
    }

    [HttpGet("payouts")]
    public async Task<IActionResult> GetAllPayoutTransactions(CancellationToken cancellationToken)
    {
        return Ok(await _adminUserService.GetAllPayoutTransactionsAsync(cancellationToken));
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardSummary(CancellationToken cancellationToken)
    {
        return Ok(await _adminUserService.GetDashboardSummaryAsync(cancellationToken));
    }
}
