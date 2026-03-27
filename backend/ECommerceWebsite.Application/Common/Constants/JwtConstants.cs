namespace ECommerceWebsite.Application.Common.Constants;

/// <summary>Shared constants for JWT and token configuration.</summary>
public static class JwtConstants
{
    /// <summary>Access token lifetime in seconds (15 minutes).</summary>
    public const int AccessTokenExpirySeconds = 900;

    /// <summary>Refresh token lifetime in days.</summary>
    public const int RefreshTokenExpiryDays = 7;
}
