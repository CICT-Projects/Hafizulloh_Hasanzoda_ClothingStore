using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.Models;
using ClothingStore.API;
using ClothingStore.API.Data;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;
    public CartController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartItem>>> GetCart() 
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var cart = await _db.Carts.Include(c => c.CartItems).ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        return Ok(cart?.CartItems ?? new List<CartItem>());
    }

    [HttpPost]
    public async Task<ActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }

        var product = await _db.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound("Product not found");
        if (request.Quantity > product.Stock) return BadRequest("Not enough stock");

        var existing = await _db.CartItems.FirstOrDefaultAsync(c => c.CartId == cart.Id && c.ProductId == request.ProductId);
        int totalQuantity = request.Quantity + (existing?.Quantity ?? 0);
        if (totalQuantity > product.Stock) return BadRequest("Not enough stock");

        if (existing != null)
        {
            existing.Quantity = totalQuantity;
        }
        else
        {
            _db.CartItems.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCart(int id, [FromBody] int quantity)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var item = await _db.CartItems
            .Include(ci => ci.Cart)
            .Where(ci => ci.Id == id)
            .FirstOrDefaultAsync();
        if (item == null || item.Cart == null || item.Cart.UserId != userId) return NotFound();
        var product = await _db.Products.FindAsync(item.ProductId);
        if (product == null || quantity > product.Stock) return BadRequest("Not enough stock");

        item.Quantity = quantity;
        item.Cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCartItem(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var item = await _db.CartItems
            .Include(ci => ci.Cart)
            .Where(ci => ci.Id == id)
            .FirstOrDefaultAsync();
        if (item == null || item.Cart == null || item.Cart.UserId != userId) return NotFound();
        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok();
    }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
