-- REQUIRED Additional Queries for Vendor Functionality
-- Run these in pgAdmin on your ShopperDb database

-- 1. Add ImageUrl column to Products table if not exists (for main product image)
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS ImageUrl VARCHAR(500);

-- 2. Add SKU column to Products if not exists
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS SKU VARCHAR(100);

-- 3. Add Brand column to Products if not exists
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS Brand VARCHAR(255);

-- 4. Add SalesCount column to Products for tracking
ALTER TABLE Products
ADD COLUMN IF NOT EXISTS SalesCount INT DEFAULT 0;

-- 5. Add VendorId column to OrderItems table if not exists
ALTER TABLE OrderItems
ADD COLUMN IF NOT EXISTS VendorId INT;

-- 6. Update OrderItems to populate VendorId from Products
UPDATE OrderItems oi
SET VendorId = p.VendorId
FROM Products p
WHERE oi.ProductId = p.Id
AND oi.VendorId IS NULL;

-- 7. Create important indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_vendorid ON Products(VendorId);
CREATE INDEX IF NOT EXISTS idx_products_categoryid ON Products(CategoryId);
CREATE INDEX IF NOT EXISTS idx_products_isactive ON Products(IsActive);
CREATE INDEX IF NOT EXISTS idx_orderitems_vendorid ON OrderItems(VendorId);
CREATE INDEX IF NOT EXISTS idx_productimages_productid ON ProductImages(ProductId);

-- 8. Insert sample categories if they don't exist
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

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Food & Groceries', 'food-groceries', 'Food items and groceries', '/images/categories/food.jpg', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'food-groceries');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Beauty & Health', 'beauty-health', 'Beauty and health products', '/images/categories/beauty.jpg', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'beauty-health');

INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
SELECT 'Toys & Games', 'toys-games', 'Toys and games for all ages', '/images/categories/toys.jpg', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'toys-games');

-- 9. Generate SKU for existing products if they don't have one
UPDATE Products
SET SKU = 'SKU-' || Id || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
WHERE SKU IS NULL OR SKU = '';

-- 10. Set default ImageUrl for products without images
UPDATE Products
SET ImageUrl = 'https://via.placeholder.com/300'
WHERE ImageUrl IS NULL OR ImageUrl = '';

-- 11. Create vendor records for existing vendor users (if not already exists)
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

-- 12. Update SalesCount for existing products
UPDATE Products p
SET SalesCount = COALESCE((
    SELECT SUM(oi.Quantity)
    FROM OrderItems oi
    WHERE oi.ProductId = p.Id
), 0)
WHERE SalesCount = 0;

-- 13. Create a view for vendor sales statistics (helpful for analytics)
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

-- 14. Create a function to update product stock after order
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

-- 15. Create trigger for stock update (drop if exists first)
DROP TRIGGER IF EXISTS update_stock_after_order ON OrderItems;
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON OrderItems
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- 16. Verification Query - Run this to check everything is set up
SELECT
    'Categories' as TableName, COUNT(*) as Count FROM Categories
UNION ALL
SELECT 'Products with Images', COUNT(*) FROM Products WHERE ImageUrl IS NOT NULL
UNION ALL
SELECT 'Products with SKU', COUNT(*) FROM Products WHERE SKU IS NOT NULL
UNION ALL
SELECT 'Vendors', COUNT(*) FROM Vendors
UNION ALL
SELECT 'Active Products', COUNT(*) FROM Products WHERE IsActive = true;