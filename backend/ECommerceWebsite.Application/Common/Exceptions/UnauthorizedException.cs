namespace ECommerceWebsite.Application.Common.Exceptions;

/// <summary>Thrown when credentials are invalid or a presented token cannot be trusted.</summary>
public sealed class UnauthorizedException : Exception
{
    /// <inheritdoc/>
    public UnauthorizedException(string message) : base(message) { }
}
