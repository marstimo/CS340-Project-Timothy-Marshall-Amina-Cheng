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

-- Browse sets
SELECT setID, name, description, releaseDate
FROM Sets
ORDER BY releaseDate DESC, name;

-- Add set
INSERT INTO Sets (name, description, releaseDate)
VALUES (@name, @description, @releaseDate);

-- Update set
UPDATE Sets
SET name=@name, description=@description, releaseDate=@releaseDate
WHERE setID=@setID;

-- Delete set
DELETE FROM Sets
WHERE setID=@setID;

----------------------------
----------Products----------
----------------------------

-- Browse products
SELECT p.productID, p.productType, s.name AS setName, p.name, p.cardCondition, p.sku, p.price, p.quantity
FROM Products p
JOIN Sets s ON p.setID = s.setID
ORDER BY p.productType, s.name, p.name;

-- Dropdown for sets
SELECT setID, name
FROM Sets
ORDER BY name;

-- Add product
INSERT INTO Products (productType, setID, name, cardCondition, sku, price, quantity)
VALUES (@productType, @setID, @name, @cardCondition, @sku, @price, @quantity);

-- Update product
UPDATE Products
SET productType=@productType, setID=@setID, name=@name, cardCondition=@cardCondition,
    sku=@sku, price=@price, quantity=@quantity
WHERE productID=@productID;

-- Delete product
DELETE FROM Products
WHERE productID=@productID;

--------------------------
----------Orders----------
--------------------------