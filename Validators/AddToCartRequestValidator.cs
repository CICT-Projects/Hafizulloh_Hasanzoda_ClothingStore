using ClothingStore.API.Controllers;
using FluentValidation;

namespace ClothingStore.API.Validators
{
    public class AddToCartRequestValidator : AbstractValidator<AddToCartRequest>
    {
        public AddToCartRequestValidator()
        {
            RuleFor(r => r.ProductId).GreaterThan(0);
            RuleFor(r => r.Quantity).GreaterThan(0);
        }
    }
}