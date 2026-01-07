using ClothingStore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.API.Data
{
    public static class ModelBuilderExtensions
    {
        public static void ApplySoftDeleteQueryFilter(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
        }
    }
}