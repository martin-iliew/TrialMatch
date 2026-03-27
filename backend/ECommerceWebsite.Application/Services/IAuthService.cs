using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Enums;

namespace ECommerceWebsite.Application.Services;

/// <summary>
/// Password hashing and credential verification contract.
/// Implementation lives in Infrastructure because it depends on BCrypt (external library).
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Hashes <paramref name="password"/> with BCrypt (work factor 12),
    /// creates a new <see cref="User"/> entity with the given <paramref name="createdAt"/> timestamp and
    /// <paramref name="role"/>, and persists it via IUserRepository.
    /// <paramref name="createdAt"/> should come from an injected <see cref="TimeProvider"/>.
    /// </summary>
    Task<User> CreateUserAsync(
        string email,
        string password,
        DateTime createdAt,
        UserRole role = UserRole.Customer,
        CancellationToken ct = default);

    /// <summary>
    /// Looks up the user by <paramref name="email"/> and verifies the BCrypt hash.
    /// Returns the user on success; returns null when the email is unknown or the password is wrong.
    /// Both failure cases return null to prevent email enumeration.
    /// </summary>
    Task<User?> VerifyCredentialsAsync(string email, string password, CancellationToken ct = default);
}
