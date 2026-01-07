using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClothingStore.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
