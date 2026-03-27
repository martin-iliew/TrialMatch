using ECommerceWebsite.Domain.Enums;

namespace ECommerceWebsite.Domain.Entities;

/// <summary>Represents an authenticated user of the system.</summary>
public sealed class User
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; private set; }

    /// <summary>Unique email address used as login name. Stored in lowercase.</summary>
    public string Email { get; private set; }

    /// <summary>BCrypt hash of the user's password. Never exposed to clients.</summary>
    public string PasswordHash { get; private set; }

    /// <summary>UTC timestamp of account creation.</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>The access role granted to this user.</summary>
    public UserRole Role { get; private set; }

    /// <summary>Navigation: all refresh tokens belonging to this user.</summary>
    public ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

    /// <summary>Creates a new user with a pre-hashed password. <paramref name="createdAt"/> should come from an injected <see cref="TimeProvider"/>.</summary>
    public User(string email, string passwordHash, DateTime createdAt, UserRole role = UserRole.Customer)
    {
        Id = Guid.NewGuid();
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        CreatedAt = createdAt;
        Role = role;
    }

    // Required by EF Core
    private User() { Email = string.Empty; PasswordHash = string.Empty; }
}
