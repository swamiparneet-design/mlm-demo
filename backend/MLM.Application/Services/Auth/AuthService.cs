using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Auth;
using MLM.Application.Placement;
using MLM.Application.StageProgression;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPlacementService _placementService;
    private readonly IStageProgressionService _stageProgressionService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IPlacementService placementService,
        IStageProgressionService stageProgressionService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _placementService = placementService;
        _stageProgressionService = stageProgressionService;
    }

    public async Task<UserDtoLite> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var emailInUse = await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (emailInUse)
        {
            throw new ConflictException($"Email '{request.Email}' is already registered.");
        }

        var mobileInUse = await _context.Users.AnyAsync(u => u.Mobile == request.Mobile, cancellationToken);
        if (mobileInUse)
        {
            throw new ConflictException($"Mobile '{request.Mobile}' is already registered.");
        }

        User? referrer = null;
        if (!string.IsNullOrWhiteSpace(request.ReferrerEmail))
        {
            referrer = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.ReferrerEmail, cancellationToken)
                ?? throw new NotFoundException($"Referrer with email '{request.ReferrerEmail}' was not found.");
        }

        var defaultZone = await _context.Zones
            .Where(z => z.IsActive)
            .OrderBy(z => z.SequenceOrder)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("No active zone is configured to place new users into.");

        await using var transaction = await _context.BeginTransactionAsync(cancellationToken);

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Mobile = request.Mobile,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = UserRole.User,
            ReferrerUserId = referrer?.Id,
            KycStatus = KycStatus.Pending,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        if (referrer is not null)
        {
            _context.UserReferrals.Add(new UserReferral
            {
                UserId = user.Id,
                ReferredByUserId = referrer.Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        var affectedAncestorIds = await _placementService.PlaceNewUserAsync(user.Id, defaultZone.Id, cancellationToken);

        var affectedUserIds = affectedAncestorIds.ToList();
        if (referrer is not null)
        {
            affectedUserIds.Add(referrer.Id);
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (affectedUserIds.Count > 0)
        {
            await _stageProgressionService.RecalculateAndCascadeAsync(affectedUserIds, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        return new UserDtoLite { Id = user.Id, FullName = user.FullName, Email = user.Email };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("This account has been deactivated.");
        }

        var token = _jwtTokenService.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(8),
            UserId = user.Id,
            FullName = user.FullName,
            Role = user.Role.ToString()
        };
    }

    public Task<VerifyOtpResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request, CancellationToken cancellationToken = default)
    {
        // TODO: PRODUCTION BLOCKER - this OTP check is a development-only mock.
        // Before going to production, replace this with a real SMS OTP provider
        // (e.g. Twilio, MSG91) that sends and verifies a one-time code against
        // request.Mobile, instead of always accepting the hardcoded "123456".
        var isValid = request.Otp == "123456";

        return Task.FromResult(new VerifyOtpResponseDto
        {
            Verified = isValid,
            Message = isValid ? "OTP verified successfully." : "Invalid OTP."
        });
    }
}
