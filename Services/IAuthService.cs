using ClothingStore.API.Models;

namespace ClothingStore.API.Services
{
    public interface IAuthService
    {
        Task<User> Register(string email, string password);
        Task<(User User, string AccessToken, string RefreshToken)> Login(string email, string password);
        Task Logout(int userId);
    }
}