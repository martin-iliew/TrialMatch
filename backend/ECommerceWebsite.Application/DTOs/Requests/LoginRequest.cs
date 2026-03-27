namespace ECommerceWebsite.Application.DTOs.Requests;

/// <summary>Payload for the POST /api/auth/login endpoint.</summary>
public record LoginRequest(string Email, string Password);
