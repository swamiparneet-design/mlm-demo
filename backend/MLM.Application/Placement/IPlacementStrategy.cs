using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.Placement;

/// <summary>
/// Pluggable strategy for deciding where in a zone's tree a newly joining user
/// should be placed. Implementations are registered in DI and selected at
/// runtime via IPlacementStrategyFactory based on Zone.PlacementStrategyType,
/// so new strategies (CapacityBased, BatchFill, ...) can be added later without
/// touching existing code.
/// </summary>
public interface IPlacementStrategy
{
    PlacementStrategyType StrategyType { get; }

    /// <summary>
    /// Determines the parent user that <paramref name="newUserId"/> should be
    /// placed under within <paramref name="zoneId"/>, and persists the resulting
    /// UserPlacement row (but does not save changes / commit - the caller owns
    /// the transaction boundary).
    /// </summary>
    Task<UserPlacement> PlaceUserAsync(int newUserId, int zoneId, CancellationToken cancellationToken = default);
}
