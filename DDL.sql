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
DROP TABLE IF EXISTS WantedItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Inventories;
DROP TABLE IF EXISTS Cards;
DROP TABLE IF EXISTS BoosterBoxes;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Sets;
DROP TABLE IF EXISTS Addresses;
DROP TABLE IF EXISTS Customers;

-------------------------------
----------Core Tables----------
-------------------------------

CREATE TABLE Customers ( -- Stores registered customers who can place orders and track wanted items
    customerID  INT AUTO_INCREMENT PRIMARY KEY,
    firstName   VARCHAR(50) NOT NULL,
    lastName    VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    CONSTRAINT uq_customers_email UNIQUE (email) -- Prevent duplicate customer emails
) ENGINE=InnoDB;

CREATE TABLE Addresses ( -- Customer shipping addresses
    addressID   INT AUTO_INCREMENT PRIMARY KEY,
    customerID  INT NOT NULL,
    line1       VARCHAR(100) NOT NULL,
    line2       VARCHAR(100),
    city        VARCHAR(50) NOT NULL,
    state       VARCHAR(50) NOT NULL,
    zipCode     VARCHAR(10) NOT NULL,
    CONSTRAINT fk_addresses_customers -- FK: each address belongs to an existing customer
        FOREIGN KEY (customerID) REFERENCES Customers(customerID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Sets ( -- Trading card sets / expansions used to group cards and booster boxes
    setID       INT AUTO_INCREMENT PRIMARY KEY,
    lastName    VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    releaseDate DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Cards ( -- Individual trading cards
    cardID      INT AUTO_INCREMENT PRIMARY KEY,
    setID       INT NOT NULL,
    productID   INT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    'condition' VARCHAR(20) NOT NULL,
    CONSTRAINT fk_cards_sets -- FK: each card must belong to a valid set
        FOREIGN KEY (setID) REFERENCES Sets(setID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cards_products -- FK: optional link from a card to a product listing
        FOREIGN KEY (productID) REFERENCES Products(productID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_cards_product UNIQUE (productID) -- Enforce 0..1 to 1 relationship: a product can map to at most 1 card
) ENGINE=InnoDB;

CREATE TABLE BoosterBoxes ( -- Sealed booster box products tied to a specific set
    boosterBoxID INT AUTO_INCREMENT PRIMARY KEY,
    setID        INT NOT NULL,
    productID    INT NULL,
    name         VARCHAR(100) NOT NULL,
    description  VARCHAR(255),
    sku          VARCHAR(50) NOT NULL,
    CONSTRAINT uq_booster_sku UNIQUE (sku), -- Prevent duplicate SKUs
    CONSTRAINT fk_booster_sets -- FK: each booster box must belong to a valid set
        FOREIGN KEY (setID) REFERENCES Sets(setID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_boosters_products -- FK: optional link from booster box to a product listing
        FOREIGN KEY (productID) REFERENCES Products(productID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_boosters_product UNIQUE (productID) -- Enforce 0..1 to 1 relationship: a product can map to at most 1 booster box
) ENGINE=InnoDB;

CREATE TABLE Inventories ( -- Tracks current price and stock quantity for each product
  inventoryID INT AUTO_INCREMENT PRIMARY KEY,
  productID   INT NOT NULL,
  price       DECIMAL(8,2) NOT NULL,
  quantity    INT NOT NULL,
  CONSTRAINT fk_inventories_products -- FK: each inventory row must reference an existing product
    FOREIGN KEY (productID) REFERENCES Products(productID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_inventories_product UNIQUE (productID) -- Enforce 1:1: each product has at most one inventory row
) ENGINE=InnoDB;

CREATE TABLE Orders ( -- Customer purchase transactions
  orderID     INT AUTO_INCREMENT PRIMARY KEY,
  customerID  INT NOT NULL,
  addressID   INT NOT NULL,
  orderNumber VARCHAR(30) NOT NULL,
  orderDate   DATETIME NOT NULL,
  orderStatus VARCHAR(30) NOT NULL,
  grandTotal  DECIMAL(10,2) NOT NULL,
  CONSTRAINT uq_orders_orderNumber UNIQUE (orderNumber), -- Prevent duplicate order numbers
  CONSTRAINT fk_orders_customers -- FK: each order must belong to an existing customer
    FOREIGN KEY (customerID) REFERENCES Customers(customerID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_addresses -- FL: each order must use an existing shipping address
    FOREIGN KEY (addressID) REFERENCES Addresses(addressID)
    ON DELETE RESTRICT ON UPDATE CASCADE
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
    ON DELETE RESTRICT ON UPDATE CASCADE
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

CREATE TABLE WantedItems ( -- Products customers want to buy when they come back in stock
  wantedItemID INT AUTO_INCREMENT PRIMARY KEY,
  productID    INT NOT NULL,
  customerID   INT NOT NULL,
  createdDate  DATETIME NOT NULL,
  CONSTRAINT fk_wanteditems_products -- FK: wanted item must reference an existing product
    FOREIGN KEY (productID) REFERENCES Products(productID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_wanteditems_customers -- FK: wanted item must reference and existing customer
    FOREIGN KEY (customerID) REFERENCES Customers(customerID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_wanted_unique UNIQUE (customerID, productID) -- Prevent same customer from wishing the same product multiple times
) ENGINE=InnoDB;

-- Sample Data