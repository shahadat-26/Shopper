using Microsoft.EntityFrameworkCore;
using ShopperBackend.Models;

namespace ShopperBackend.Data
{
    public class ShopperDbContext : DbContext
    {
        public ShopperDbContext(DbContextOptions<ShopperDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<Address> Addresses { get; set; }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
        public DbSet<ProductVariation> ProductVariations { get; set; }

        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }

        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewImage> ReviewImages { get; set; }

        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NewsletterSubscriber> NewsletterSubscribers { get; set; }
        public DbSet<Banner> Banners { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));

            // Configure Npgsql to use UTC for all timestamps
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);

            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure all DateTime properties to be treated as UTC
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(
                            new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                                v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
                                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(
                            new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
                                v => v.HasValue
                                    ? v.Value.Kind == DateTimeKind.Unspecified
                                        ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                                        : v.Value.ToUniversalTime()
                                    : v,
                                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v));
                    }
                }
            }

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");

                entity.HasKey(u => u.Id);

                entity.HasIndex(u => u.Email).IsUnique();

                entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
                entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).IsRequired().HasMaxLength(50);

                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(u => u.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Name).IsRequired().HasMaxLength(255);
                entity.Property(p => p.Price).HasPrecision(10, 2);
                entity.Property(p => p.CompareAtPrice).HasPrecision(10, 2);
                entity.Property(p => p.Cost).HasPrecision(10, 2);
                entity.Property(p => p.IsActive).HasDefaultValue(true);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(p => p.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.Vendor)
                    .WithMany(v => v.Products)
                    .HasForeignKey(p => p.VendorId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(p => p.Slug).IsUnique();
                entity.HasIndex(p => p.CategoryId);
                entity.HasIndex(p => p.VendorId);
                entity.HasIndex(p => p.IsActive);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Slug).IsRequired().HasMaxLength(100);
                entity.Property(c => c.IsActive).HasDefaultValue(true);

                entity.HasIndex(c => c.Slug).IsUnique();

                entity.HasOne(c => c.ParentCategory)
                    .WithMany(c => c.SubCategories)
                    .HasForeignKey(c => c.ParentCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("orders");
                entity.HasKey(o => o.Id);

                entity.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
                entity.Property(o => o.Status).IsRequired().HasMaxLength(50);
                entity.Property(o => o.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(o => o.PaymentStatus).IsRequired().HasMaxLength(50);
                entity.Property(o => o.SubTotal).HasPrecision(10, 2);
                entity.Property(o => o.TaxAmount).HasPrecision(10, 2);
                entity.Property(o => o.ShippingAmount).HasPrecision(10, 2);
                entity.Property(o => o.TotalAmount).HasPrecision(10, 2);
                entity.Property(o => o.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(o => o.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(o => o.User)
                    .WithMany()
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.ShippingAddress)
                    .WithMany()
                    .HasForeignKey(o => o.ShippingAddressId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.BillingAddress)
                    .WithMany()
                    .HasForeignKey(o => o.BillingAddressId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(o => o.OrderNumber).IsUnique();
                entity.HasIndex(o => o.UserId);
                entity.HasIndex(o => o.Status);
                entity.HasIndex(o => o.CreatedAt);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("orderitems");
                entity.HasKey(oi => oi.Id);

                entity.Property(oi => oi.Quantity).IsRequired();
                entity.Property(oi => oi.Price).HasPrecision(10, 2);
                entity.Property(oi => oi.Total).HasPrecision(10, 2);

                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                    .WithMany()
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(oi => oi.OrderId);
                entity.HasIndex(oi => oi.ProductId);
            });

            modelBuilder.Entity<ShoppingCart>(entity =>
            {
                entity.ToTable("shoppingcarts");
                entity.HasKey(sc => sc.Id);

                entity.Property(sc => sc.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(sc => sc.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(sc => sc.User)
                    .WithOne()
                    .HasForeignKey<ShoppingCart>(sc => sc.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(sc => sc.UserId).IsUnique();
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.ToTable("cartitems");
                entity.HasKey(ci => ci.Id);

                entity.Property(ci => ci.Quantity).IsRequired();
                entity.Property(ci => ci.Price).HasPrecision(10, 2);
                entity.Property(ci => ci.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(ci => ci.Cart)
                    .WithMany(sc => sc.CartItems)
                    .HasForeignKey(ci => ci.CartId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                    .WithMany()
                    .HasForeignKey(ci => ci.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(ci => new { ci.CartId, ci.ProductId }).IsUnique();
            });

            modelBuilder.Entity<Vendor>(entity =>
            {
                entity.ToTable("vendors");
                entity.HasKey(v => v.Id);

                entity.Property(v => v.StoreName).IsRequired().HasMaxLength(255);
                entity.Property(v => v.BusinessEmail).HasMaxLength(255);
                entity.Property(v => v.IsApproved).HasDefaultValue(false);
                entity.Property(v => v.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(v => v.User)
                    .WithOne()
                    .HasForeignKey<Vendor>(v => v.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(v => v.UserId).IsUnique();
                entity.HasIndex(v => v.StoreName);
            });

            modelBuilder.Entity<Address>(entity =>
            {
                entity.ToTable("addresses");
                entity.HasKey(a => a.Id);

                entity.Property(a => a.AddressLine1).IsRequired().HasMaxLength(255);
                entity.Property(a => a.City).IsRequired().HasMaxLength(100);
                entity.Property(a => a.State).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Country).IsRequired().HasMaxLength(100);
                entity.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);
                entity.Property(a => a.IsDefault).HasDefaultValue(false);

                entity.HasOne(a => a.User)
                    .WithMany(u => u.Addresses)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(a => a.UserId);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasKey(r => r.Id);

                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.IsVerifiedPurchase).HasDefaultValue(false);
                entity.Property(r => r.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Product)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(r => r.ProductId);
                entity.HasIndex(r => r.UserId);
                entity.HasIndex(r => new { r.ProductId, r.UserId }).IsUnique();
            });

            modelBuilder.Entity<Wishlist>(entity =>
            {
                entity.ToTable("wishlists");
                entity.HasKey(w => w.Id);

                entity.Property(w => w.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(w => w.User)
                    .WithMany()
                    .HasForeignKey(w => w.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(w => w.Product)
                    .WithMany()
                    .HasForeignKey(w => w.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(w => new { w.UserId, w.ProductId }).IsUnique();
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.ToTable("coupons");
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Code).IsRequired().HasMaxLength(50);
                entity.Property(c => c.DiscountValue).HasPrecision(10, 2);
                entity.Property(c => c.MinimumAmount).HasPrecision(10, 2);
                entity.Property(c => c.IsActive).HasDefaultValue(true);
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(c => c.Code).IsUnique();
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("payments");
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Amount).HasPrecision(10, 2);
                entity.Property(p => p.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(p => p.Status).IsRequired().HasMaxLength(50);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(p => p.Order)
                    .WithOne(o => o.Payment)
                    .HasForeignKey<Payment>(p => p.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(p => p.OrderId).IsUnique();
                entity.HasIndex(p => p.TransactionId);
            });

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetTableName(entity.GetTableName()?.ToLower());

                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(property.GetColumnName().ToLower());
                }

                foreach (var key in entity.GetForeignKeys())
                {
                    key.SetConstraintName(key.GetConstraintName()?.ToLower());
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(index.GetDatabaseName()?.ToLower());
                }
            }
        }
    }
}