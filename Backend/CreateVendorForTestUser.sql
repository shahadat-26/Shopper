-- Create vendor record for the test vendor user
INSERT INTO Vendors (UserId, StoreName, StoreDescription, IsApproved)
SELECT
    u.Id,
    CONCAT(u.FirstName, ' ', u.LastName, '''s Store'),
    'Welcome to our test store!',
    true
FROM Users u
LEFT JOIN Vendors v ON v.UserId = u.Id
WHERE u.Email = 'testvendor@test.com' AND v.Id IS NULL;

-- Verify the vendor was created
SELECT v.Id as VendorId, v.UserId, u.Email, u.FirstName, u.LastName, v.StoreName
FROM Vendors v
JOIN Users u ON v.UserId = u.Id
WHERE u.Email = 'testvendor@test.com';