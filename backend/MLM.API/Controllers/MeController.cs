using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Users;
using MLM.Application.Services.Users;

namespace MLM.API.Controllers;

/// <summary>
/// Every action here resolves the acting user's id exclusively from
/// ICurrentUserService (backed by JWT claims) - never from the URL or query
/// string - so a user can only ever see their own data and their own downline.
/// </summary>
[ApiController]
[Route("api/me")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly IMyAccountService _myAccountService;
    private readonly ICurrentUserService _currentUserService;

    public MeController(IMyAccountService myAccountService, ICurrentUserService currentUserService)
    {
        _myAccountService = myAccountService;
        _currentUserService = currentUserService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        return Ok(await _myAccountService.GetMyProfileAsync(_currentUserService.UserId, cancellationToken));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileDto request, CancellationToken cancellationToken)
    {
        return Ok(await _myAccountService.UpdateMyProfileAsync(_currentUserService.UserId, request, cancellationToken));
    }

    [HttpGet("progress")]
    public async Task<IActionResult> GetMyZoneProgress(CancellationToken cancellationToken)
    {
        return Ok(await _myAccountService.GetMyZoneProgressAsync(_currentUserService.UserId, cancellationToken));
    }

    [HttpGet("placement-tree")]
    public async Task<IActionResult> GetMyPlacementTree([FromQuery] int zoneId, CancellationToken cancellationToken)
    {
        var tree = await _myAccountService.GetMyPlacementTreeAsync(_currentUserService.UserId, zoneId, cancellationToken);
        return Ok(tree);
    }

    [HttpGet("referrals")]
    public async Task<IActionResult> GetMyDirectReferrals(CancellationToken cancellationToken)
    {
        return Ok(await _myAccountService.GetMyDirectReferralsAsync(_currentUserService.UserId, cancellationToken));
    }

    [HttpGet("payouts")]
    public async Task<IActionResult> GetMyPayoutHistory(CancellationToken cancellationToken)
    {
        return Ok(await _myAccountService.GetMyPayoutHistoryAsync(_currentUserService.UserId, cancellationToken));
    }
}
