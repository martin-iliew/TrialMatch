// ECommerceWebsite.Domain/Interfaces/IRefreshTokenRepository.cs
using ECommerceWebsite.Domain.Entities;

namespace ECommerceWebsite.Domain.Interfaces;

/// <summary>Data access contract for <see cref="RefreshToken"/> entities.</summary>
public interface IRefreshTokenRepository
{
    /// <summary>Returns the refresh token whose stored hash matches <paramref name="tokenHash"/>, or null.</summary>
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);

    /// <summary>Persists a new refresh token.</summary>
    Task AddAsync(RefreshToken token, CancellationToken ct = default);

    /// <summary>
    /// Atomically revokes <paramref name="consumed"/> and persists <paramref name="replacement"/>
    /// in a single database transaction. Use this for token rotation to prevent a state where
    /// the old token is revoked but no replacement exists.
    /// </summary>
    Task RotateAsync(RefreshToken consumed, RefreshToken replacement, CancellationToken ct = default);

    /// <summary>
    /// Sets RevokedAt to now on every token sharing <paramref name="family"/>.
    /// Called on reuse detection to invalidate the full rotation chain.
    /// </summary>
    Task RevokeAllByFamilyAsync(Guid family, CancellationToken ct = default);

    /// <summary>Persists changes to an existing refresh token (e.g., after calling Revoke()).</summary>
    Task UpdateAsync(RefreshToken token, CancellationToken ct = default);
}
