namespace ECommerceWebsite.Domain.Entities;

/// <summary>A hashed refresh token tied to a user session family.</summary>
public sealed class RefreshToken
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; private set; }

    /// <summary>SHA-256 hex hash of the raw token sent to the client. The raw value is never stored.</summary>
    public string TokenHash { get; private set; }

    /// <summary>Owner of this token.</summary>
    public Guid UserId { get; private set; }

    /// <summary>UTC expiry. Token is invalid after this point even if not revoked.</summary>
    public DateTime ExpiresAt { get; private set; }

    /// <summary>
    /// Groups tokens that belong to the same login chain.
    /// On reuse detection, every token sharing this family is immediately revoked.
    /// </summary>
    public Guid Family { get; private set; }

    /// <summary>UTC creation time.</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>Set when this token is rotated out or explicitly revoked. Null means still active.</summary>
    public DateTime? RevokedAt { get; private set; }

    /// <summary>
    /// Returns true when this token has not been revoked and has not yet expired at <paramref name="now"/>.
    /// Use this instead of checking <see cref="RevokedAt"/> and <see cref="ExpiresAt"/> separately.
    /// </summary>
    public bool IsActiveAt(DateTime now) => RevokedAt is null && ExpiresAt > now;

    /// <summary>Navigation: owning user.</summary>
    public User? User { get; private set; }

    /// <summary>Creates an active refresh token. <paramref name="createdAt"/> should come from an injected <see cref="TimeProvider"/>.</summary>
    public RefreshToken(string tokenHash, Guid userId, DateTime expiresAt, Guid family, DateTime createdAt)
    {
        Id = Guid.NewGuid();
        TokenHash = tokenHash;
        UserId = userId;
        ExpiresAt = expiresAt;
        Family = family;
        CreatedAt = createdAt;
    }

    /// <summary>Marks this token as revoked at <paramref name="revokedAt"/>. Caller should supply value from an injected <see cref="TimeProvider"/>.</summary>
    public void Revoke(DateTime revokedAt) => RevokedAt = revokedAt;

    // Required by EF Core
    private RefreshToken() { TokenHash = string.Empty; }
}
