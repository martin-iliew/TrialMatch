namespace ECommerceWebsite.Application.DTOs.Responses;

/// <summary>
/// Returned from login and token-refresh endpoints.
/// Contains only the access token — the refresh token travels exclusively as an HttpOnly cookie.
/// </summary>
public record AuthResponse(string AccessToken, int ExpiresIn);
