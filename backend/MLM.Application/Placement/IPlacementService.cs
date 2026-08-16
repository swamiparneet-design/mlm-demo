namespace MLM.Application.Placement;

public interface IPlacementService
{
    /// <summary>
    /// Places <paramref name="newUserId"/> into <paramref name="zoneId"/> using the
    /// zone's configured strategy, maintains the PlacementClosure table, and
    /// initializes the user's UserZoneProgress row for that zone.
    /// Does not open/commit a transaction or call SaveChanges - the caller owns that.
    /// </summary>
    /// <returns>The list of ancestor user ids (excluding the new user) whose
    /// placement counts are now affected and must be recalculated.</returns>
    Task<IReadOnlyList<int>> PlaceNewUserAsync(int newUserId, int zoneId, CancellationToken cancellationToken = default);
}
