-- ManaVault Inventory Manager - CS340
-- Team: Amina Cheng, Timothy Marshall
-- Demo CUD

DROP PROCEDURE IF EXISTS DemoDeleteTimCustomer;

DELIMITER //

CREATE PROCEDURE DemoDeleteTimCustomer()
BEGIN
    DELETE FROM Customers WHERE email = 'tim@example.com';
END//

DELIMITER ;