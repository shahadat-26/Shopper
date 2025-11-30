-- Find the vendor ID for your user
SELECT v.Id as VendorId, v.UserId, u.Email, u.FirstName, u.LastName
FROM Vendors v
JOIN Users u ON v.UserId = u.Id
WHERE u.Role = 'Vendor';