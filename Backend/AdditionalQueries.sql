-- Additional Database Queries for Vendor Functionality
-- Run these queries in your PostgreSQL database (ShopperDb)

-- 1. Add ImageUrl column to Products table if not exists
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS ImageUrl VARCHAR(500);

-- 2. Create ProductImages table for multiple product images
CREATE TABLE IF NOT EXISTS ProductImages (
    Id SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    IsMainImage BOOLEAN DEFAULT false,
    DisplayOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_vendorid ON Products(VendorId);
CREATE INDEX IF NOT EXISTS idx_products_categoryid ON Products(CategoryId);
CREATE INDEX IF NOT EXISTS idx_products_isactive ON Products(IsActive);
CREATE INDEX IF NOT EXISTS idx_orderitems_vendorid ON OrderItems(VendorId);
CREATE INDEX IF NOT EXISTS idx_productimages_productid ON ProductImages(ProductId);

-- 4. Add VendorId column to OrderItems table if not exists
ALTER TABLE OrderItems
ADD COLUMN IF NOT EXISTS VendorId INT;

-- 5. Update OrderItems to populate VendorId from Products
UPDATE OrderItems oi
SET VendorId = p.VendorId
FROM Products p
WHERE oi.ProductId = p.Id
AND oi.VendorId IS NULL;

-- 6. Add sample categories if they don't exist
INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Electronics', 'electronics', 'Electronic devices and accessories', '/images/categories/electronics.jpg', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'electronics');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Clothing', 'clothing', 'Fashion and apparel', '/images/categories/clothing.jpg', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'clothing');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Books', 'books', 'Books and stationery', '/images/categories/books.jpg', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'books');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Home & Garden', 'home-garden', 'Home decor and garden items', '/images/categories/home.jpg', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'home-garden');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', '/images/categories/sports.jpg', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'sports-outdoors');

-- 7. Update Products table to ensure all products have ImageUrl
UPDATE Products
SET ImageUrl = 'https://via.placeholder.com/300'
WHERE ImageUrl IS NULL OR ImageUrl = '';

-- 8. Add SKU column to Products if not exists
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS SKU VARCHAR(100);

-- 9. Generate SKU for existing products if they don't have one
UPDATE Products
SET SKU = 'SKU-' || Id || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
WHERE SKU IS NULL OR SKU = '';

-- 10. Add Brand column to Products if not exists
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS Brand VARCHAR(255);

-- 11. Create a view for vendor sales statistics
CREATE OR REPLACE VIEW VendorSalesStatistics AS
SELECT
    p.VendorId,
    COUNT(DISTINCT oi.OrderId) as TotalOrders,
    SUM(oi.Quantity) as TotalItemsSold,
    SUM(oi.Total) as TotalRevenue,
    COUNT(DISTINCT p.Id) as TotalProducts,
    COUNT(DISTINCT CASE WHEN p.IsActive THEN p.Id END) as ActiveProducts
FROM Products p
LEFT JOIN OrderItems oi ON p.Id = oi.ProductId
GROUP BY p.VendorId;

-- 12. Create a function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Products
    SET Quantity = Quantity - NEW.Quantity,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE Id = NEW.ProductId;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger for stock update
DROP TRIGGER IF EXISTS update_stock_after_order ON OrderItems;
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON OrderItems
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- 14. Add SalesCount column to Products for tracking
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS SalesCount INT DEFAULT 0;

-- 15. Update SalesCount for existing products
UPDATE Products p
SET SalesCount = COALESCE((
    SELECT SUM(oi.Quantity)
    FROM OrderItems oi
    WHERE oi.ProductId = p.Id
), 0)
WHERE SalesCount = 0;

-- 16. Create Vendors table if not exists (for vendor-specific information)
CREATE TABLE IF NOT EXISTS Vendors (
    Id SERIAL PRIMARY KEY,
    UserId INT UNIQUE NOT NULL,
    StoreName VARCHAR(255) NOT NULL,
    StoreDescription TEXT,
    LogoUrl VARCHAR(500),
    BannerUrl VARCHAR(500),
    BusinessEmail VARCHAR(255),
    BusinessPhone VARCHAR(50),
    TaxNumber VARCHAR(100),
    CommissionRate DECIMAL(5,2) DEFAULT 10.00,
    Rating DECIMAL(3,2) DEFAULT 0,
    TotalSales INT DEFAULT 0,
    IsApproved BOOLEAN DEFAULT false,
    ApprovedAt TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 17. Create vendor records for existing vendor users
INSERT INTO Vendors (UserId, StoreName, StoreDescription, BusinessEmail, IsApproved)
SELECT
    u.Id,
    CONCAT(u.FirstName, '''s Store'),
    'Welcome to our store!',
    u.Email,
    true
FROM Users u
WHERE u.Role = 'Vendor'
AND NOT EXISTS (SELECT 1 FROM Vendors v WHERE v.UserId = u.Id);

-- 18. Update VendorId in Products to match Vendor UserId
UPDATE Products p
SET VendorId = v.UserId
FROM Vendors v
WHERE p.VendorId = v.Id;

-- 19. Add constraint to ensure VendorId references Users with Vendor role
-- First, ensure all products have valid vendor IDs
UPDATE Products
SET VendorId = (SELECT Id FROM Users WHERE Role = 'Vendor' LIMIT 1)
WHERE VendorId IS NULL OR VendorId NOT IN (SELECT Id FROM Users WHERE Role = 'Vendor');

-- 20. Grant necessary permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- Verification Queries - Run these to check if everything is set up correctly:
-- SELECT COUNT(*) FROM Categories;
-- SELECT COUNT(*) FROM Products WHERE ImageUrl IS NOT NULL;
-- SELECT COUNT(*) FROM Vendors;
-- SELECT * FROM VendorSalesStatistics;