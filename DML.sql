/*
ManaVualt Inventory Manager - CS340
Team: Amina Cheng, Timothy Marshall
DML Queries
*/

-----------------------------
----------Customers----------
-----------------------------

-- Browse customers
SELECT customerID, firstName, lastName, email, phoneNumber, address1, address2, city, state, zipCode
FROM Customers
ORDER BY lastName, firstName;

-- Add customer
INSERT INTO Customers (firstName, lastName, email, phoneNumber, address1, address2, city, state, zipCode)
VALUES (@firstName, @lastName, @email, @phoneNumber, @address1, @address2, @city, @state, @zipCode);

-- Update customer
UPDATE Customers
SET firstName=@firstName, lastName=@lastName, email=@email, phoneNumber=@phoneNumber,
    address1=@address1, address2=@address2, city=@city, state=@state, zipCode=@zipCode
WHERE customerID=@customerID;

-- Delete customer
DELETE FROM Customers
WHERE customerID=@customerID;

------------------------
----------Sets----------
------------------------