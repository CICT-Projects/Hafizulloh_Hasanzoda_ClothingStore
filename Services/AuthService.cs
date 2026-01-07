using BCrypt.Net;
using ClothingStore.API.Models;
using Microsoft.EntityFrameworkCore;
using static BCrypt.Net.BCrypt;
using ClothingStore.API.Data;
namespace ClothingStore.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly ITokenService _tokenService;

        public AuthService(AppDbContext db, ITokenService tokenService)
        {
            _db = db;
            _tokenService = tokenService;
        }

        public async Task<User> Register(string email, string password)
        {
            if (await _db.Users.AnyAsync(u => u.Email == email))
                throw new Exception("User already exists");

            var user = new User
            {
                Email = email,
                PasswordHash = HashPassword(password),
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Создать корзину для пользователя
            var cart = new Cart
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();

            return user;
        }

        public async Task<(User User, string AccessToken, string RefreshToken)> Login(string email, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !Verify(password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.Now.AddDays(7);
            await _db.SaveChangesAsync();

            return (user, accessToken, refreshToken);
        }

        public async Task Logout(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                await _db.SaveChangesAsync();
            }
        }
    }
}