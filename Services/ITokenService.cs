using ClothingStore.API.Models;

namespace ClothingStore.API.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        Task<(string AccessToken, string RefreshToken)> RefreshTokens(string refreshToken);
    }
}