-- Check if categories exist
SELECT COUNT(*) as category_count FROM Categories;

-- List all categories
SELECT * FROM Categories;

-- If no categories, insert them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Categories) THEN
        INSERT INTO Categories (Name, Slug, Description, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
        VALUES
            ('Electronics', 'electronics', 'Electronic devices and accessories', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Clothing', 'clothing', 'Fashion and apparel', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen items', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Books', 'books', 'Books and educational materials', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        RAISE NOTICE 'Categories inserted successfully';
    ELSE
        RAISE NOTICE 'Categories already exist';
    END IF;
END $$;