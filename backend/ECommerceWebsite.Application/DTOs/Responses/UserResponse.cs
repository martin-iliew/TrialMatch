using ECommerceWebsite.Domain.Enums;

namespace ECommerceWebsite.Application.DTOs.Responses;

/// <summary>Public user profile data. Safe to serialise to JSON and return to clients.</summary>
public record UserResponse(Guid Id, string Email, DateTime CreatedAt, UserRole Role);
