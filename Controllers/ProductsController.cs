using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.Models;
using ClothingStore.API;
using ClothingStore.API.Data;
using Serilog;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        int? categoryId, decimal? minPrice, decimal? maxPrice, int page = 1, int pageSize = 10)
    {
        try
        {
            var query = _db.Products.IgnoreQueryFilters().AsQueryable();

            query = query.Where(p => !p.IsDeleted);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            var total = await query.CountAsync();
            var products = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            Log.Information("Fetched {Count} products for page {Page}", products.Count, page);
            return Ok(new { products, total, page, pageSize });
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error fetching products");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }
}
