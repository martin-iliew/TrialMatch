namespace ECommerceWebsite.Application.Common.Exceptions;

/// <summary>Thrown when an operation conflicts with existing state (e.g., duplicate email on register).</summary>
public sealed class ConflictException : Exception
{
    /// <inheritdoc/>
    public ConflictException(string message) : base(message) { }
}
