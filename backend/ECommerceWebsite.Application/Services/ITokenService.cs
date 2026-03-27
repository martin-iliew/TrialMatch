using ECommerceWebsite.Domain.Entities;

namespace ECommerceWebsite.Application.Services;

/// <summary>Handles all cryptographic token operations. Implementation lives in Infrastructure.</summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a signed RS256 JWT access token for the given user.
    /// Expiry is <c>JwtConstants.AccessTokenExpirySeconds</c> seconds from <paramref name="now"/>.
    /// </summary>
    string GenerateAccessToken(User user, DateTimeOffset now);

    /// <summary>
    /// Returns a cryptographically-random, URL-safe string suitable for use as a refresh token.
    /// The caller must hash the value with <see cref="HashToken"/> before storing it.
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>Returns the SHA-256 hex-encoded hash of <paramref name="token"/>.</summary>
    string HashToken(string token);
}
