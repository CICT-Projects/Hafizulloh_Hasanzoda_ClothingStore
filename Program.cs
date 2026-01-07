using ClothingStore.API.Data;
using ClothingStore.API.Services;
using ClothingStore.API.Models;
using ClothingStore.API.BackgroundJobs;
using ClothingStore.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Настройка логирования
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.json", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Настройка CORS (ОБЯЗАТЕЛЬНО для React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173") // Порты CRA и Vite
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 3. База данных (SQLite для тестирования)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();

// 4. JWT Аутентификация
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "SuperSecretKey1234567890!"))
        };
    });

builder.Services.AddAuthorization();

// Регистрация сервисов
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOrderService, OrderService>();
// builder.Services.AddHostedService<CartCleanupService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Настройка Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact"); // Включаем CORS
app.UseHttpsRedirection();
app.UseStaticFiles(); // Для обслуживания изображений
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 5. БЕЗОПАСНЫЙ SEED DATA (Асинхронный)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        if (!await db.Categories.AnyAsync())
        {
            var electronics = new Category { Name = "Electronics" };
            var clothing = new Category { Name = "Clothing" };
            await db.Categories.AddRangeAsync(electronics, clothing);
            await db.SaveChangesAsync();

            await db.Products.AddRangeAsync(
                new Product { Name = "Laptop", Description = "Gaming laptop", CategoryId = electronics.Id, Price = 1200, Size = "15\"", Color = "Black", Stock = 10, ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
                new Product { Name = "T-Shirt", Description = "Cotton t-shirt", CategoryId = clothing.Id, Price = 20, Size = "M", Color = "Blue", Stock = 50, ImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
                new Product { Name = "Jeans", Description = "Denim jeans", CategoryId = clothing.Id, Price = 50, Size = "32", Color = "Dark Blue", Stock = 30, ImageUrl = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
                new Product { Name = "Sneakers", Description = "Running sneakers", CategoryId = clothing.Id, Price = 80, Size = "10", Color = "White", Stock = 20, ImageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400" },
                new Product { Name = "Smartphone", Description = "Latest smartphone", CategoryId = electronics.Id, Price = 800, Size = "6.5\"", Color = "Silver", Stock = 15, ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
                new Product { Name = "Headphones", Description = "Wireless headphones", CategoryId = electronics.Id, Price = 150, Size = "One Size", Color = "Black", Stock = 25, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
                new Product { Name = "Jacket", Description = "Winter jacket", CategoryId = clothing.Id, Price = 100, Size = "L", Color = "Black", Stock = 12, ImageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
                new Product { Name = "Watch", Description = "Smart watch", CategoryId = electronics.Id, Price = 250, Size = "42mm", Color = "Black", Stock = 8, ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.Users.AnyAsync())
        {
            var authService = services.GetRequiredService<IAuthService>();
            // Используем await вместо .Wait()
            await authService.Register("admin@example.com", "admin123");
            
            var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@example.com");
            if (admin != null)
            {
                admin.Role = Role.Admin;
                await db.SaveChangesAsync();
            }
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Ошибка при инициализации БД");
    }
}

await app.RunAsync(); // Используем RunAsync