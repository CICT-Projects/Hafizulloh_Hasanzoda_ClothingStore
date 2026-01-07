using ClothingStore.API.Models;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.Data;
namespace ClothingStore.API.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrder(int userId, List<CartItem> cartItems);
    }

    public class OrderService : IOrderService
    {
        private readonly AppDbContext _db;

        public OrderService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Order> CreateOrder(int userId, List<CartItem> cartItems)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // Проверить и уменьшить Stock
                foreach (var item in cartItems)
                {
                    var product = await _db.Products.FindAsync(item.ProductId);
                    if (product == null || product.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException("Insufficient stock");
                    }
                    product.Stock -= item.Quantity;
                }

                // Создать Order
                var order = new Order
                {
                    UserId = userId,
                    TotalAmount = cartItems.Sum(i => i.Product!.Price * i.Quantity),
                    CreatedAt = DateTime.UtcNow,
                    Status = OrderStatus.Created,
                    OrderItems = cartItems.Select(i => new OrderItem
                    {
                        ProductId = i.ProductId,
                        Quantity = i.Quantity,
                        Price = i.Product!.Price
                    }).ToList()
                };

                _db.Orders.Add(order);
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();
                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}