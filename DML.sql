/*
ManaVault Inventory Manager - CS340 Portfolio Project
Team: Amina Cheng, Timothy Marshall

Citation / Originality Statement:
This DML file was developed by the team for the CS340 portfolio project.
It documents the browse queries, dropdown queries, and stored procedure calls used by the application.
AI tools were used for formatting help and syntax cleanup.
All final queries and application behavior were reviewed by the team.
*/

-- -------------------------
-- --------Customers--------
-- -------------------------

-- Browse customers
SELECT customerID, firstName, lastName, email, phoneNumber, address1, address2, city, state, zipCode
FROM Customers
ORDER BY lastName, firstName;

-- Add customer
CALL CreateCustomer(@firstName, @lastName, @email, @phoneNumber, @address1, @address2, @city, @state, @zipCode);

-- Update customer
CALL UpdateCustomer(@customerID, @firstName, @lastName, @email, @phoneNumber, @address1, @address2, @city, @state, @zipCode);

-- Delete customer
CALL DeleteCustomer(@customerID);

-- --------------------
-- --------Sets--------
-- --------------------

-- Browse sets
SELECT setID, name, description, releaseDate
FROM Sets
ORDER BY releaseDate DESC, name;

-- Add set
CALL CreateSetRecord(@name, @description, @releaseDate);

-- Update set
CALL UpdateSetRecord(@setID, @name, @description, @releaseDate);

-- Delete set
CALL DeleteSetRecord(@setID);

-- ------------------------
-- --------Products--------
-- ------------------------

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
CALL CreateProduct(@productType, @setID, @name, @cardCondition, @sku, @price, @quantity);

-- Update product
CALL UpdateProduct(@productID, @productType, @setID, @name, @cardCondition, @sku, @price, @quantity);

-- Delete product
CALL DeleteProduct(@productID);

-- ----------------------
-- --------Orders--------
-- ----------------------

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

-- Dropdown for orders with a more user-friendly label
SELECT o.orderID,
       CONCAT('Order #', o.orderID, ' - ',
              COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
              ' - ',
              DATE_FORMAT(o.orderDate, '%Y-%m-%d')) AS orderLabel
FROM Orders o
LEFT JOIN Customers c ON o.customerID = c.customerID
ORDER BY o.orderDate DESC;

-- Add order
-- orderNumber is auto-generated in the stored procedure
CALL CreateOrderRecord(@customerID, @orderDate, @orderStatus, @grandTotal);

-- Update order
CALL UpdateOrderRecord(@orderID, @customerID, @orderDate, @orderStatus, @grandTotal);

-- Delete order
CALL DeleteOrderRecord(@orderID);

-- --------------------------
-- --------OrderItems--------
-- --------------------------

-- Browse order items
SELECT oi.orderItemID, o.orderNumber, p.name AS productName,
       oi.unitPrice, oi.quantity, oi.amount
FROM OrderItems oi
JOIN Orders o ON oi.orderID = o.orderID
JOIN Products p ON oi.productID = p.productID
ORDER BY o.orderDate DESC, o.orderNumber, oi.orderItemID;

-- Dropdown for orders
SELECT o.orderID,
       CONCAT('Order #', o.orderID, ' - ',
              COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
              ' - ',
              DATE_FORMAT(o.orderDate, '%Y-%m-%d')) AS orderLabel
FROM Orders o
LEFT JOIN Customers c ON o.customerID = c.customerID
ORDER BY o.orderDate DESC;

-- Dropdown for products
SELECT productID, CONCAT(name, ' ($', price, ')') AS productLabel
FROM Products
ORDER BY name;

-- Add order item (insert into M:N relationship)
CALL CreateOrderItem(@orderID, @productID, @unitPrice, @quantity);

-- Update order item (update one M:N relationship)
CALL UpdateOrderItem(@orderItemID, @orderID, @productID, @unitPrice, @quantity);

-- Delete order item (delete from one M:N relationship)
CALL DeleteOrderItem(@orderItemID);

-- ------------------------
-- --------Payments--------
-- ------------------------

-- Browse payments
SELECT pay.paymentID, o.orderNumber, pay.paymentNumber, pay.paymentMethod, pay.amount, pay.paymentDate
FROM Payments pay
JOIN Orders o ON pay.orderID = o.orderID
ORDER BY pay.paymentDate DESC;

-- Dropdown for orders
SELECT o.orderID,
       CONCAT('Order #', o.orderID, ' - ',
              COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
              ' - ',
              DATE_FORMAT(o.orderDate, '%Y-%m-%d')) AS orderLabel
FROM Orders o
LEFT JOIN Customers c ON o.customerID = c.customerID
ORDER BY o.orderDate DESC;

-- Add payment
CALL CreatePayment(@orderID, @paymentNumber, @paymentMethod, @amount, @paymentDate);

-- Update payment
CALL UpdatePayment(@paymentID, @orderID, @paymentNumber, @paymentMethod, @amount, @paymentDate);

-- Delete payment
CALL DeletePayment(@paymentID);

-- ------------------------
-- --------RESET DB--------
-- ------------------------

-- Reset database
CALL ResetManaVault();