using MLM.Domain.Enums;

namespace MLM.Domain.Interfaces;

/// <summary>
/// Exposes the identity of the currently authenticated caller, sourced exclusively
/// from JWT claims. Service-layer authorization checks (e.g. "only see your own
/// downline") must always use this instead of any client-supplied identifier.
/// </summary>
public interface ICurrentUserService
{
    int UserId { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
}
