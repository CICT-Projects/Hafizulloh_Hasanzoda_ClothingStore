
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClothingStore.API.Models
{
    public enum OrderStatus
    {
        Created,
        Paid,
        Shipped,
        Delivered
    }

    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Created;
        
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
