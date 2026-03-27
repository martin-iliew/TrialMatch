namespace ECommerceWebsite.Application.DTOs.Responses;

/// <summary>
/// Internal result record returned by login and refresh handlers.
/// The raw <see cref="RefreshToken"/> string is given to the controller so it can set
/// the HttpOnly cookie. It is never serialised to JSON.
/// </summary>
public record TokenResult(AuthResponse Auth, string RefreshToken);
