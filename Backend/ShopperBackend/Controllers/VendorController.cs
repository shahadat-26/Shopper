using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ShopperBackend.Services;
using ShopperBackend.DTOs;
using System.Security.Claims;

namespace ShopperBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Vendor")]
    public class VendorController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IOrderService _orderService;
        private readonly ICategoryService _categoryService;
        private readonly IVendorService _vendorService;

        public VendorController(
            IProductService productService,
            IOrderService orderService,
            ICategoryService categoryService,
            IVendorService vendorService)
        {
            _productService = productService;
            _orderService = orderService;
            _categoryService = categoryService;
            _vendorService = vendorService;
        }

        [HttpGet("products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetVendorProducts()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            var products = await _productService.GetVendorProductsAsync(vendor.Id);
            return Ok(products);
        }

        [HttpPost("products")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto productDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }

            productDto.VendorId = vendor.Id;
            var product = await _productService.CreateProductAsync(productDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpGet("products/{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }

            var product = await _productService.GetProductByIdAsync(id);
            if (product == null || product.VendorId != vendor.Id)
                return NotFound();

            return Ok(product);
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }

            var existingProduct = await _productService.GetProductByIdAsync(id);
            if (existingProduct == null || existingProduct.VendorId != vendor.Id)
                return NotFound();

            await _productService.UpdateProductAsync(id, productDto);
            return NoContent();
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }

            var product = await _productService.GetProductByIdAsync(id);
            if (product == null || product.VendorId != vendor.Id)
                return NotFound();

            await _productService.DeleteProductAsync(id);
            return NoContent();
        }

        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetVendorOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            var orders = await _vendorService.GetVendorOrdersAsync(vendor.Id);
            return Ok(orders);
        }

        [HttpPut("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusDto statusDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            await _vendorService.UpdateOrderStatusAsync(orderId, vendor.Id, statusDto.Status);
            return NoContent();
        }

        [HttpPut("orders/{orderId}/decline")]
        public async Task<IActionResult> DeclineOrder(int orderId, [FromBody] dynamic declineDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            await _vendorService.UpdateOrderStatusAsync(orderId, vendor.Id, "Cancelled");
            return NoContent();
        }

        [HttpPut("orders/{orderId}/deliver")]
        public async Task<IActionResult> DeliverOrder(int orderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            await _vendorService.UpdateOrderStatusAsync(orderId, vendor.Id, "Delivered");
            return NoContent();
        }

        [HttpGet("analytics")]
        public async Task<ActionResult<VendorAnalyticsDto>> GetAnalytics()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            var analytics = await _vendorService.GetVendorAnalyticsAsync(vendor.Id);
            return Ok(analytics);
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<VendorDashboardDto>> GetDashboardStats()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }
            var stats = await _vendorService.GetDashboardStatsAsync(vendor.Id);
            return Ok(stats);
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost("products/{productId}/images")]
        public async Task<IActionResult> UploadProductImage(int productId, IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image file provided");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
            {
                return BadRequest("Vendor profile not found.");
            }

            var product = await _productService.GetProductByIdAsync(productId);
            if (product == null || product.VendorId != vendor.Id)
                return NotFound();

            using (var memoryStream = new MemoryStream())
            {
                await image.CopyToAsync(memoryStream);
                var imageData = memoryStream.ToArray();
                var mimeType = image.ContentType;

                var updateDto = new UpdateProductDto
                {
                    ImageData = imageData,
                    ImageMimeType = mimeType
                };
                await _productService.UpdateProductAsync(productId, updateDto);
            }

            return Ok(new { message = "Image uploaded successfully" });
        }
    }
}