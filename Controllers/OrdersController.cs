using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.Models;
using ClothingStore.API;
using ClothingStore.API.Data;
using Serilog;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult> CreateOrder()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var cart = await _db.Carts.Include(c => c.CartItems).ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null || !cart.CartItems.Any()) return BadRequest("Cart is empty");

        using (var transaction = await _db.Database.BeginTransactionAsync())
        {
            try
            {
                var order = new Order
                {
                    UserId = userId,
                    TotalAmount = cart.CartItems.Sum(c => c.Quantity * c.Product!.Price),
                    CreatedAt = DateTime.UtcNow
                };

                _db.Orders.Add(order);
                await _db.SaveChangesAsync();

                foreach (var item in cart.CartItems)
                {
                    _db.OrderItems.Add(new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = item.Product!.Price
                    });

                    // Уменьшаем stock
                    item.Product!.Stock -= item.Quantity;
                }

                _db.CartItems.RemoveRange(cart.CartItems);
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();
                Log.Information("Order created: {@Order}", order);
                return Ok(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var orders = await _db.Orders.Where(o => o.UserId == userId)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .IgnoreQueryFilters()
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var order = await _db.Orders.Include(o => o.OrderItems)
                                    .ThenInclude(oi => oi.Product)
                                    .IgnoreQueryFilters()
                                    .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order == null) return NotFound();
        return Ok(order);
    }
}
