/*
ManaVault Inventory Manager - CS340
Team: Amina Cheng, Timothy Marshall
Step 2 Draft - DDL + Sample Data
*/

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
START TRANSACTION;

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

-- Core Tables

CREATE TABLE Customers (
    customerID  INT AUTO_INCREMENT PRIMARY KEY,
    firstName   VARCHAR(50) NOT NULL,
    lastName    VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    CONSTRAINT uq_customers_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE Addresses (
    addressID   INT AUTO_INCREMENT PRIMARY KEY,
    customerID  INT NOT NULL,
    line1       VARCHAR(100) NOT NULL,
    line2       VARCHAR(100),
    city        VARCHAR(50) NOT NULL,
    state       VARCHAR(50) NOT NULL,
    zipCode     VARCHAR(10) NOT NULL,
    CONSTRAINT fk_addresses_customers
        FOREIGN KEY (customerID) REFERENCES Customers(customerID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;