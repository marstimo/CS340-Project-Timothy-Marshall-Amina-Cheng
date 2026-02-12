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

-- Browse orders
SELECT o.orderID, o.orderNumber, o.orderDate, o.orderStatus, o.grandTotal,
       c.customerID, c.firstName, c.lastName, c.email
FROM Orders o
LEFT JOIN Customers c ON o.customerID = c.customerID
ORDER BY o.orderDate DESC;

-- Dropdown for customers
SELECT customerID, CONCAT(firstName, ' ', lastName, ' (', email, ')') AS customerLabel
FROM Customers
ORDER BY lastName, firstName;

-- Add order
INSERT INTO Orders (customerID, orderNumber, orderDate, orderStatus, grandTotal)
VALUES (@customerID, @orderNumber, @orderDate, @orderStatus, @grandTotal);

-- Update order
UPDATE Orders
SET customerID=@customerID, orderNumber=@orderNumber, orderDate=@orderDate,
    orderStatus=@orderStatus, grandTotal=@grandTotal
WHERE orderID=@orderID;

-- Delete order
DELETE FROM Orders
WHERE orderID=@orderID;

------------------------------
----------OrderItems----------
------------------------------

-- Browse order items
SELECT oi.orderItemID, o.orderNumber, p.name AS productName,
       oi.unitPrice, oi.quantity, oi.amount
FROM OrderItems oi
JOIN Orders o ON oi.orderID = o.orderID
JOIN Products p ON oi.productID = p.productID
ORDER BY o.orderDate DESC, o.orderNumber, oi.orderItemID;

-- Dropdown for orders
SELECT orderID, orderNumber
FROM Orders
ORDER BY orderDate DESC;

-- Dropdown for products
SELECT productID, CONCAT(name, ' ($', price, ')') AS productLabel
FROM Products
ORDER BY name;

-- Add order item
INSERT INTO OrderItems (orderID, productID, unitPrice, quantity, amount)
VALUES (@orderID, @productID, @unitPrice, @quantity, @amount);

-- Update order item
UPDATE OrderItems
SET orderID=@orderID, productID=@productID, unitPrice=@unitPrice,
    quantity=@quantity, amount=@amount
WHERE orderItemID=@orderItemID;

-- Delete order item
DELETE FROM OrderItems
WHERE orderItemID=@orderItemID;

----------------------------
----------Payments----------
----------------------------