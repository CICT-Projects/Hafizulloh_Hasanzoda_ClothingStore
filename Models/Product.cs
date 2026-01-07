using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace ClothingStore.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Description { get; set; }


        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public decimal Price { get; set; }
        [Required]
        public string? Size { get; set; }
        [Required]
        public string? Color { get; set; }
        public int Stock { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
