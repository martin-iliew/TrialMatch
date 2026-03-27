namespace ECommerceWebsite.Application.DTOs.Requests;

/// <summary>Payload for the POST /api/auth/register endpoint.</summary>
public record RegisterRequest(string Email, string Password);
