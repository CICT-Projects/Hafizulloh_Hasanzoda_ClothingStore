using ClothingStore.API.Models;
using FluentValidation;

namespace ClothingStore.API.Validators
{
    public class CreateProductValidator : AbstractValidator<Product>
    {
        public CreateProductValidator()
        {
            RuleFor(p => p.Name).NotEmpty().MaximumLength(100);
            RuleFor(p => p.Description).NotEmpty().MaximumLength(500);
            RuleFor(p => p.CategoryId).GreaterThan(0);
            RuleFor(p => p.Price).GreaterThan(0);
            RuleFor(p => p.Size).NotEmpty();
            RuleFor(p => p.Color).NotEmpty();
            RuleFor(p => p.Stock).GreaterThanOrEqualTo(0);
        }
    }
}