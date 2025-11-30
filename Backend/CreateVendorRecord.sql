-- Check if vendor records exist for vendor users
SELECT u.Id, u.Email, u.Role, v.Id as VendorId, v.StoreName
FROM Users u
LEFT JOIN Vendors v ON v.UserId = u.Id
WHERE u.Role = 'Vendor';

-- If vendor records are missing, create them
INSERT INTO Vendors (UserId, StoreName, StoreDescription, IsApproved)
SELECT
    u.Id,
    CONCAT(u.FirstName, ' ', u.LastName, '''s Store'),
    'Welcome to our store!',
    true
FROM Users u
LEFT JOIN Vendors v ON v.UserId = u.Id
WHERE u.Role = 'Vendor' AND v.Id IS NULL;