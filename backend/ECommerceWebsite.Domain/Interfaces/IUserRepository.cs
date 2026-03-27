// ECommerceWebsite.Domain/Interfaces/IUserRepository.cs
using ECommerceWebsite.Domain.Entities;

namespace ECommerceWebsite.Domain.Interfaces;

/// <summary>Data access contract for <see cref="User"/> entities.</summary>
public interface IUserRepository
{
    /// <summary>Returns the user with the given id, or null if not found.</summary>
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns the user with the given email address (case-insensitive), or null if not found.</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);

    /// <summary>Persists a new user.</summary>
    Task AddAsync(User user, CancellationToken ct = default);

    /// <summary>Persists changes to an existing user.</summary>
    Task UpdateAsync(User user, CancellationToken ct = default);
}
