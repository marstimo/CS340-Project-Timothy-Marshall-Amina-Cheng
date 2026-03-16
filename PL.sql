/*
ManaVault Inventory Manager - CS340 Portfolio Project
Team: Amina Cheng, Timothy Marshall

Citation / Originality Statement:
This PL.sql file was developed by the team for the CS340 portfolio project.
The stored procedures, business rules, and reset logic were written and adapted by the team
to match the project schema and rubric requirements.
AI tools were used for brainstorming, syntax cleanup, debugging help, and requirement alignment.
All final SQL has been reviewed and tested by the team on the class database.
*/

DROP PROCEDURE IF EXISTS CreateCustomer;
DROP PROCEDURE IF EXISTS UpdateCustomer;
DROP PROCEDURE IF EXISTS DeleteCustomer;

DROP PROCEDURE IF EXISTS CreateSetRecord;
DROP PROCEDURE IF EXISTS UpdateSetRecord;
DROP PROCEDURE IF EXISTS DeleteSetRecord;

DROP PROCEDURE IF EXISTS CreateProduct;
DROP PROCEDURE IF EXISTS UpdateProduct;
DROP PROCEDURE IF EXISTS DeleteProduct;

DROP PROCEDURE IF EXISTS CreateOrderRecord;
DROP PROCEDURE IF EXISTS UpdateOrderRecord;
DROP PROCEDURE IF EXISTS DeleteOrderRecord;

DROP PROCEDURE IF EXISTS CreateOrderItem;
DROP PROCEDURE IF EXISTS UpdateOrderItem;
DROP PROCEDURE IF EXISTS DeleteOrderItem;

DROP PROCEDURE IF EXISTS CreatePayment;
DROP PROCEDURE IF EXISTS UpdatePayment;
DROP PROCEDURE IF EXISTS DeletePayment;

DROP PROCEDURE IF EXISTS ResetManaVault;

DELIMITER //

CREATE PROCEDURE CreateCustomer(
    IN p_firstName VARCHAR(50),
    IN p_lastName VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_phoneNumber VARCHAR(15),
    IN p_address1 VARCHAR(100),
    IN p_address2 VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_zipCode VARCHAR(10)
)
BEGIN
    INSERT INTO Customers (
        firstName, lastName, email, phoneNumber,
        address1, address2, city, state, zipCode
    )
    VALUES (
        p_firstName, p_lastName, p_email, NULLIF(p_phoneNumber, ''),
        p_address1, NULLIF(p_address2, ''), p_city, p_state, p_zipCode
    );
END//

CREATE PROCEDURE UpdateCustomer(
    IN p_customerID INT,
    IN p_firstName VARCHAR(50),
    IN p_lastName VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_phoneNumber VARCHAR(15),
    IN p_address1 VARCHAR(100),
    IN p_address2 VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_zipCode VARCHAR(10)
)
BEGIN
    UPDATE Customers
    SET
        firstName = p_firstName,
        lastName = p_lastName,
        email = p_email,
        phoneNumber = NULLIF(p_phoneNumber, ''),
        address1 = p_address1,
        address2 = NULLIF(p_address2, ''),
        city = p_city,
        state = p_state,
        zipCode = p_zipCode
    WHERE customerID = p_customerID;
END//

CREATE PROCEDURE DeleteCustomer(IN p_customerID INT)
BEGIN
    DELETE FROM Customers
    WHERE customerID = p_customerID;
END//

CREATE PROCEDURE CreateSetRecord(
    IN p_name VARCHAR(100),
    IN p_description VARCHAR(255),
    IN p_releaseDate DATE
)
BEGIN
    INSERT INTO Sets (name, description, releaseDate)
    VALUES (p_name, NULLIF(p_description, ''), p_releaseDate);
END//

CREATE PROCEDURE UpdateSetRecord(
    IN p_setID INT,
    IN p_name VARCHAR(100),
    IN p_description VARCHAR(255),
    IN p_releaseDate DATE
)
BEGIN
    UPDATE Sets
    SET
        name = p_name,
        description = NULLIF(p_description, ''),
        releaseDate = p_releaseDate
    WHERE setID = p_setID;
END//

CREATE PROCEDURE DeleteSetRecord(IN p_setID INT)
BEGIN
    DELETE FROM Sets
    WHERE setID = p_setID;
END//

CREATE PROCEDURE CreateProduct(
    IN p_productType VARCHAR(10),
    IN p_setID INT,
    IN p_name VARCHAR(100),
    IN p_cardCondition VARCHAR(10),
    IN p_sku VARCHAR(50),
    IN p_price DECIMAL(8,2),
    IN p_quantity INT
)
BEGIN
    INSERT INTO Products (
        productType, setID, name, cardCondition, sku, price, quantity
    )
    VALUES (
        p_productType,
        p_setID,
        p_name,
        NULLIF(p_cardCondition, ''),
        NULLIF(p_sku, ''),
        p_price,
        p_quantity
    );
END//

CREATE PROCEDURE UpdateProduct(
    IN p_productID INT,
    IN p_productType VARCHAR(10),
    IN p_setID INT,
    IN p_name VARCHAR(100),
    IN p_cardCondition VARCHAR(10),
    IN p_sku VARCHAR(50),
    IN p_price DECIMAL(8,2),
    IN p_quantity INT
)
BEGIN
    UPDATE Products
    SET
        productType = p_productType,
        setID = p_setID,
        name = p_name,
        cardCondition = NULLIF(p_cardCondition, ''),
        sku = NULLIF(p_sku, ''),
        price = p_price,
        quantity = p_quantity
    WHERE productID = p_productID;
END//

CREATE PROCEDURE DeleteProduct(IN p_productID INT)
BEGIN
    DELETE FROM Products
    WHERE productID = p_productID;
END//

CREATE PROCEDURE CreateOrderRecord(
    IN p_customerID INT,
    IN p_orderDate DATETIME,
    IN p_orderStatus VARCHAR(30),
    IN p_grandTotal DECIMAL(10,2)
)
BEGIN
    DECLARE v_newOrderID INT;
    DECLARE v_firstName VARCHAR(50);
    DECLARE v_datePart VARCHAR(20);
    DECLARE v_orderNumber VARCHAR(60);

    INSERT INTO Orders (customerID, orderNumber, orderDate, orderStatus, grandTotal)
    VALUES (NULLIF(p_customerID, 0), 'TEMP', p_orderDate, p_orderStatus, p_grandTotal);

    SET v_newOrderID = LAST_INSERT_ID();

    IF p_customerID IS NULL OR p_customerID = 0 THEN
        SET v_firstName = 'Guest';
    ELSE
        SELECT firstName
        INTO v_firstName
        FROM Customers
        WHERE customerID = p_customerID
        LIMIT 1;
    END IF;

    SET v_datePart = DATE_FORMAT(p_orderDate, '%Y%m%d');
    SET v_orderNumber = CONCAT('ORD-', LPAD(v_newOrderID, 4, '0'), '-', LEFT(v_firstName, 8), '-', v_datePart);

    UPDATE Orders
    SET orderNumber = v_orderNumber
    WHERE orderID = v_newOrderID;
END//

CREATE PROCEDURE UpdateOrderRecord(
    IN p_orderID INT,
    IN p_customerID INT,
    IN p_orderDate DATETIME,
    IN p_orderStatus VARCHAR(30),
    IN p_grandTotal DECIMAL(10,2)
)
BEGIN
    UPDATE Orders
    SET
        customerID = NULLIF(p_customerID, 0),
        orderDate = p_orderDate,
        orderStatus = p_orderStatus,
        grandTotal = p_grandTotal
    WHERE orderID = p_orderID;
END//

CREATE PROCEDURE DeleteOrderRecord(IN p_orderID INT)
BEGIN
    DELETE FROM Orders
    WHERE orderID = p_orderID;
END//

CREATE PROCEDURE CreateOrderItem(
    IN p_orderID INT,
    IN p_productID INT,
    IN p_unitPrice DECIMAL(8,2),
    IN p_quantity INT
)
BEGIN
    INSERT INTO OrderItems (orderID, productID, unitPrice, quantity, amount)
    VALUES (p_orderID, p_productID, p_unitPrice, p_quantity, ROUND(p_unitPrice * p_quantity, 2));
END//

CREATE PROCEDURE UpdateOrderItem(
    IN p_orderItemID INT,
    IN p_orderID INT,
    IN p_productID INT,
    IN p_unitPrice DECIMAL(8,2),
    IN p_quantity INT
)
BEGIN
    UPDATE OrderItems
    SET
        orderID = p_orderID,
        productID = p_productID,
        unitPrice = p_unitPrice,
        quantity = p_quantity,
        amount = ROUND(p_unitPrice * p_quantity, 2)
    WHERE orderItemID = p_orderItemID;
END//

CREATE PROCEDURE DeleteOrderItem(IN p_orderItemID INT)
BEGIN
    DELETE FROM OrderItems
    WHERE orderItemID = p_orderItemID;
END//

CREATE PROCEDURE CreatePayment(
    IN p_orderID INT,
    IN p_paymentNumber VARCHAR(50),
    IN p_paymentMethod VARCHAR(30),
    IN p_amount DECIMAL(10,2),
    IN p_paymentDate DATETIME
)
BEGIN
    INSERT INTO Payments (orderID, paymentNumber, paymentMethod, amount, paymentDate)
    VALUES (p_orderID, p_paymentNumber, p_paymentMethod, p_amount, p_paymentDate);
END//

CREATE PROCEDURE UpdatePayment(
    IN p_paymentID INT,
    IN p_orderID INT,
    IN p_paymentNumber VARCHAR(50),
    IN p_paymentMethod VARCHAR(30),
    IN p_amount DECIMAL(10,2),
    IN p_paymentDate DATETIME
)
BEGIN
    UPDATE Payments
    SET
        orderID = p_orderID,
        paymentNumber = p_paymentNumber,
        paymentMethod = p_paymentMethod,
        amount = p_amount,
        paymentDate = p_paymentDate
    WHERE paymentID = p_paymentID;
END//

CREATE PROCEDURE DeletePayment(IN p_paymentID INT)
BEGIN
    DELETE FROM Payments
    WHERE paymentID = p_paymentID;
END//

CREATE PROCEDURE ResetManaVault()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;

    DROP TABLE IF EXISTS OrderItems;
    DROP TABLE IF EXISTS Payments;
    DROP TABLE IF EXISTS Orders;
    DROP TABLE IF EXISTS Products;
    DROP TABLE IF EXISTS Sets;
    DROP TABLE IF EXISTS Customers;

    CREATE TABLE Customers (
        customerID  INT AUTO_INCREMENT PRIMARY KEY,
        firstName   VARCHAR(50) NOT NULL,
        lastName    VARCHAR(50) NOT NULL,
        email       VARCHAR(100) NOT NULL,
        phoneNumber VARCHAR(15) NULL,
        address1    VARCHAR(100) NOT NULL,
        address2    VARCHAR(100) NULL,
        city        VARCHAR(50) NOT NULL,
        state       VARCHAR(50) NOT NULL,
        zipCode     VARCHAR(10) NOT NULL,
        CONSTRAINT uq_customers_email UNIQUE (email)
    ) ENGINE=InnoDB;

    CREATE TABLE Sets (
        setID       INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        releaseDate DATE NOT NULL,
        CONSTRAINT uq_sets_name UNIQUE (name)
    ) ENGINE=InnoDB;

    CREATE TABLE Products (
        productID     INT AUTO_INCREMENT PRIMARY KEY,
        productType   ENUM('CARD','BOX') NOT NULL,
        setID         INT NOT NULL,
        name          VARCHAR(100) NOT NULL,
        cardCondition ENUM('NM','LP','MP','HP','DMG') NULL,
        sku           VARCHAR(50) NULL,
        price         DECIMAL(8,2) NOT NULL,
        quantity      INT NOT NULL,
        CONSTRAINT fk_products_sets
            FOREIGN KEY (setID) REFERENCES Sets(setID)
            ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT uq_products_sku UNIQUE (sku)
    ) ENGINE=InnoDB;

    CREATE TABLE Orders (
        orderID     INT AUTO_INCREMENT PRIMARY KEY,
        customerID  INT NULL,
        orderNumber VARCHAR(60) NOT NULL,
        orderDate   DATETIME NOT NULL,
        orderStatus VARCHAR(30) NOT NULL,
        grandTotal  DECIMAL(10,2) NOT NULL,
        CONSTRAINT uq_orders_orderNumber UNIQUE (orderNumber),
        CONSTRAINT fk_orders_customers
            FOREIGN KEY (customerID) REFERENCES Customers(customerID)
            ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE OrderItems (
        orderItemID INT AUTO_INCREMENT PRIMARY KEY,
        orderID     INT NOT NULL,
        productID   INT NOT NULL,
        unitPrice   DECIMAL(8,2) NOT NULL,
        quantity    INT NOT NULL,
        amount      DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_orderitems_orders
            FOREIGN KEY (orderID) REFERENCES Orders(orderID)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_orderitems_products
            FOREIGN KEY (productID) REFERENCES Products(productID)
            ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT uq_orderitems_order_product UNIQUE (orderID, productID)
    ) ENGINE=InnoDB;

    CREATE TABLE Payments (
        paymentID      INT AUTO_INCREMENT PRIMARY KEY,
        orderID        INT NOT NULL,
        paymentNumber  VARCHAR(50) NOT NULL,
        paymentMethod  VARCHAR(30) NOT NULL,
        amount         DECIMAL(10,2) NOT NULL,
        paymentDate    DATETIME NOT NULL,
        CONSTRAINT uq_payments_paymentNumber UNIQUE (paymentNumber),
        CONSTRAINT uq_payments_order UNIQUE (orderID),
        CONSTRAINT fk_payments_orders
            FOREIGN KEY (orderID) REFERENCES Orders(orderID)
            ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB;

    INSERT INTO Customers (firstName, lastName, email, phoneNumber, address1, address2, city, state, zipCode) VALUES
    ('Tim', 'Marshall', 'tim@example.com', '555-111-2222', '123 SW Oak St', NULL, 'Corvallis', 'OR', '97330'),
    ('Amina', 'Cheng', 'amina@example.com', '555-333-4444', '900 SE Pine St', NULL, 'Albany', 'OR', '97321'),
    ('Carlos', 'Vasquez', 'carlos@example.com', '555-777-8888', '455 NW Maple Ave', 'Unit 4', 'Salem', 'OR', '97301');

    INSERT INTO Sets (name, description, releaseDate) VALUES
    ('Modern Horizons 3', 'A modern-focused Magic set.', '2024-06-14'),
    ('Bloomburrow', 'Fantasy woodland-themed Magic set.', '2024-08-02'),
    ('Scarlet & Violet', 'Pokémon TCG base set.', '2023-03-31');

    INSERT INTO Products (productType, setID, name, cardCondition, sku, price, quantity) VALUES
    ('CARD', (SELECT setID FROM Sets WHERE name='Modern Horizons 3' LIMIT 1), 'Ulamog, the Defiler', 'NM', NULL, 39.99, 2),
    ('CARD', (SELECT setID FROM Sets WHERE name='Bloomburrow' LIMIT 1), 'Mabel, Heir to Cragflame', 'LP', NULL, 12.50, 0),
    ('CARD', (SELECT setID FROM Sets WHERE name='Scarlet & Violet' LIMIT 1), 'Pikachu', 'NM', NULL, 4.99, 12),
    ('BOX', (SELECT setID FROM Sets WHERE name='Modern Horizons 3' LIMIT 1), 'Modern Horizons 3 Booster Box', NULL, 'MH3-BB-001', 249.99, 5);

    INSERT INTO Orders (customerID, orderNumber, orderDate, orderStatus, grandTotal) VALUES
    ((SELECT customerID FROM Customers WHERE email='tim@example.com' LIMIT 1), 'ORD-0001-Tim-20260203', '2026-02-03 10:15:00', 'Processing', 289.98),
    ((SELECT customerID FROM Customers WHERE email='amina@example.com' LIMIT 1), 'ORD-0002-Amina-20260203', '2026-02-03 11:30:00', 'Shipped', 4.99),
    ((SELECT customerID FROM Customers WHERE email='carlos@example.com' LIMIT 1), 'ORD-0003-Carlos-20260204', '2026-02-04 14:00:00', 'Open', 52.49);

    INSERT INTO OrderItems (orderID, productID, unitPrice, quantity, amount) VALUES
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0001-Tim-20260203' LIMIT 1), (SELECT productID FROM Products WHERE name='Modern Horizons 3 Booster Box' LIMIT 1), 249.99, 1, 249.99),
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0001-Tim-20260203' LIMIT 1), (SELECT productID FROM Products WHERE name='Ulamog, the Defiler' LIMIT 1), 39.99, 1, 39.99),
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0002-Amina-20260203' LIMIT 1), (SELECT productID FROM Products WHERE name='Pikachu' LIMIT 1), 4.99, 1, 4.99),
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0003-Carlos-20260204' LIMIT 1), (SELECT productID FROM Products WHERE name='Mabel, Heir to Cragflame' LIMIT 1), 12.50, 2, 25.00);

    INSERT INTO Payments (orderID, paymentNumber, paymentMethod, amount, paymentDate) VALUES
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0001-Tim-20260203' LIMIT 1), 'PAY-90001', 'Credit Card', 289.98, '2026-02-03 10:16:00'),
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0002-Amina-20260203' LIMIT 1), 'PAY-90002', 'Debit Card', 4.99, '2026-02-03 11:31:00'),
    ((SELECT orderID FROM Orders WHERE orderNumber='ORD-0003-Carlos-20260204' LIMIT 1), 'PAY-90003', 'Cash', 52.49, '2026-02-04 14:05:00');

    SET FOREIGN_KEY_CHECKS = 1;
END//

DELIMITER ;