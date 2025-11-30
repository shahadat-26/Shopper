-- Insert sample categories if they don't exist
INSERT INTO Categories (Name, Slug, Description, ImageUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
VALUES
    ('Electronics', 'electronics', 'Electronic devices and accessories', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Clothing', 'clothing', 'Fashion and apparel', NULL, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen items', NULL, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Books', 'books', 'Books and educational materials', NULL, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL, 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Beauty & Personal Care', 'beauty-personal-care', 'Beauty products and personal care items', NULL, 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Toys & Games', 'toys-games', 'Toys and games for all ages', NULL, 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Food & Groceries', 'food-groceries', 'Food items and groceries', NULL, 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (Slug) DO NOTHING;