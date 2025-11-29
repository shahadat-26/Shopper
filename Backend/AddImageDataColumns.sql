-- Add columns to store image data directly in the database
ALTER TABLE Products
ADD COLUMN ImageData BYTEA,
ADD COLUMN ImageMimeType VARCHAR(50);

-- Update existing products to have null image data
UPDATE Products SET ImageData = NULL, ImageMimeType = NULL;

-- Optional: Drop the old ImageUrl column (only after confirming everything works)
-- ALTER TABLE Products DROP COLUMN ImageUrl;