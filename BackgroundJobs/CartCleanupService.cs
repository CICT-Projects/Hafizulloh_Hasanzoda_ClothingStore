using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using ClothingStore.API;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.Data;
using Serilog;
namespace ClothingStore.API.BackgroundJobs
{
    public class CartCleanupService : IHostedService, IDisposable
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private Timer? _timer;

        public CartCleanupService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(6));
            return Task.CompletedTask;
        }

        private async void DoWork(object? state)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var cutoffDate = DateTime.UtcNow.AddDays(-7);
            var oldCarts = await db.Carts
                .Where(c => c.UpdatedAt < cutoffDate)
                .ToListAsync();

            if (oldCarts.Any())
            {
                db.Carts.RemoveRange(oldCarts);
                await db.SaveChangesAsync();
                Log.Information("Cart cleanup completed. Deleted {Count} old carts", oldCarts.Count);
            }
            else
            {
                Log.Information("Cart cleanup completed. No old carts to delete");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}