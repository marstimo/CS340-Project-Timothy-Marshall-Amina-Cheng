/*
ManaVault Inventory Manager - CS340
Team: Amina Cheng, Timothy Marshall
DDL + Sample Data
*/

SET FOREIGN_KEY_CHECKS = 0; -- Disable FK checks during rebuild
SET AUTOCOMMIT = 0; -- Disable autocommit so schema loads as a single transaction
START TRANSACTION; -- Begin atomic schema creation

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Sets;
DROP TABLE IF EXISTS Customers;

-- ---------------------------
-- --------Core Tables--------
-- ---------------------------

CREATE TABLE Customers ( -- Stores registered customers who can place orders and track wanted items
    customerID  INT AUTO_INCREMENT PRIMARY KEY,
    firstName   VARCHAR(50) NOT NULL,
    lastName    VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15) NULL,
    -- Shipping address fields below
    address1    VARCHAR(100) NOT NULL,
    address2    VARCHAR(100) NULL,
    city        VARCHAR(50)  NOT NULL,
    state       VARCHAR(50)  NOT NULL,
    zipCode     VARCHAR(10)  NOT NULL,
    CONSTRAINT uq_customers_email UNIQUE (email) -- Prevent duplicate customer emails
) ENGINE=InnoDB;

CREATE TABLE Sets ( -- Trading card sets / expansions used to group cards and booster boxes
    setID       INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    releaseDate DATE NOT NULL,
    CONSTRAINT uq_sets_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE Products (
  productID    INT AUTO_INCREMENT PRIMARY KEY,
  productType  ENUM('CARD','BOX') NOT NULL,
  setID        INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  cardCondition ENUM('NM','LP','MP','HP','DMG') NULL, -- Only applies to cards, boxes can be NULL
  sku          VARCHAR(50) NULL, -- Only applies to boxes; cards can be NULL
  price        DECIMAL(8,2) NOT NULL,
  quantity     INT NOT NULL,
  CONSTRAINT fk_products_sets
    FOREIGN KEY (setID) REFERENCES Sets(setID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_products_sku UNIQUE (sku)   -- Make SKUs unique when present
) ENGINE=InnoDB;

CREATE TABLE Orders ( -- Customer purchase transactions
  orderID     INT AUTO_INCREMENT PRIMARY KEY,
  customerID  INT NULL,
  orderNumber VARCHAR(30) NOT NULL,
  orderDate   DATETIME NOT NULL,
  orderStatus VARCHAR(30) NULL,
  grandTotal  DECIMAL(10,2) NOT NULL,
  CONSTRAINT uq_orders_orderNumber UNIQUE (orderNumber), -- Prevent duplicate order numbers
  CONSTRAINT fk_orders_customers -- FK: each order must belong to an existing customer
    FOREIGN KEY (customerID) REFERENCES Customers(customerID)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE OrderItems ( -- Intersection table resolving the M:N relationship between Orders and Products
  orderItemID INT AUTO_INCREMENT PRIMARY KEY,
  orderID     INT NOT NULL,
  productID   INT NOT NULL,
  unitPrice   DECIMAL(8,2) NOT NULL,
  quantity    INT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orderitems_orders -- FK: each order item must belong to an existing order
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_orderitems_products -- FK: each order item must reference an existing product
    FOREIGN KEY (productID) REFERENCES Products(productID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_orderitems_order_product UNIQUE (orderID, productID)
) ENGINE=InnoDB;

CREATE TABLE Payments ( -- Payment records associated with completed orders
  paymentID      INT AUTO_INCREMENT PRIMARY KEY,
  orderID        INT NOT NULL,
  paymentNumber  VARCHAR(50) NOT NULL,
  paymentMethod  VARCHAR(30) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  paymentDate    DATETIME NOT NULL,
  CONSTRAINT uq_payments_paymentNumber UNIQUE (paymentNumber), -- Prevent duplicate payment numbers
  CONSTRAINT uq_payments_order UNIQUE (orderID), -- Enforce 1:1: at most one payment record per order
  CONSTRAINT fk_payments_orders -- FK: each payment must be linked to an existing order
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------
-- --------Sample Data--------
-- ---------------------------

INSERT INTO Customers (firstName, lastName, email, phoneNumber, address1, address2, city, state, zipCode) VALUES
('Tim', 'Marshall', 'tim@example.com', '555-111-2222', '123 SW Oak St', NULL, 'Corvallis', 'OR', '97330'),
('Amina', 'Cheng', 'amina@example.com', '555-333-4444', '900 SE Pine St', NULL, 'Albany', 'OR', '97321');

INSERT INTO Sets (name, description, releaseDate) VALUES
('Modern Horizons 3', 'A modern-focused Magic set.', '2024-06-14'),
('Bloomburrow', 'Fantasy woodland-themed Magic set.', '2024-08-02'),
('Scarlet & Violet', 'Pokémon TCG base set.', '2023-03-31');

INSERT INTO Products (productType, setID, name, cardCondition, sku, price, quantity) VALUES
('CARD',
 (SELECT setID FROM Sets WHERE name='Modern Horizons 3' LIMIT 1),
 'Ulamog, the Defiler', 'NM', NULL, 39.99, 2),

('CARD',
 (SELECT setID FROM Sets WHERE name='Bloomburrow' LIMIT 1),
 'Mabel, Heir to Cragflame', 'LP', NULL, 12.50, 0),

('CARD',
 (SELECT setID FROM Sets WHERE name='Scarlet & Violet' LIMIT 1),
 'Pikachu', 'NM', NULL, 4.99, 12),

('BOX',
 (SELECT setID FROM Sets WHERE name='Modern Horizons 3' LIMIT 1),
 'Modern Horizons 3 Booster Box', NULL, 'MH3-BB-001', 249.99, 5);

INSERT INTO Orders (customerID, orderNumber, orderDate, orderStatus, grandTotal) VALUES
((SELECT customerID FROM Customers WHERE email='tim@example.com' LIMIT 1),
 'ORD-10001', '2026-02-03 10:15:00', 'Processing', 289.98),

((SELECT customerID FROM Customers WHERE email='amina@example.com' LIMIT 1),
 'ORD-10002', '2026-02-03 11:30:00', 'Shipped', 4.99);

INSERT INTO OrderItems (orderID, productID, unitPrice, quantity, amount) VALUES
((SELECT orderID FROM Orders WHERE orderNumber='ORD-10001' LIMIT 1),
 (SELECT productID FROM Products WHERE name='Modern Horizons 3 Booster Box' LIMIT 1),
 249.99, 1, 249.99),

((SELECT orderID FROM Orders WHERE orderNumber='ORD-10001' LIMIT 1),
 (SELECT productID FROM Products WHERE name='Ulamog, the Defiler' LIMIT 1),
 39.99, 1, 39.99),

((SELECT orderID FROM Orders WHERE orderNumber='ORD-10002' LIMIT 1),
 (SELECT productID FROM Products WHERE name='Pikachu' LIMIT 1),
 4.99, 1, 4.99);

INSERT INTO Payments (orderID, paymentNumber, paymentMethod, amount, paymentDate) VALUES
((SELECT orderID FROM Orders WHERE orderNumber='ORD-10001' LIMIT 1),
 'PAY-90001', 'Credit Card', 289.98, '2026-02-03 10:16:00'),

((SELECT orderID FROM Orders WHERE orderNumber='ORD-10002' LIMIT 1),
 'PAY-90002', 'Debit Card', 4.99, '2026-02-03 11:31:00');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;