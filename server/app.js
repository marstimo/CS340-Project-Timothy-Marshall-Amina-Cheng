// EXPRESS
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 7777;

// DATABASE
const db = require('./database/db-connector');

// HANDLEBARS
const { engine } = require('express-handlebars');
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

function nullIfEmpty(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

// HOME
app.get('/', async function (req, res) {
    try {
        res.render('home');
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('An error occurred while rendering the page.');
    }
});

app.get('/home', async function (req, res) {
    try {
        res.render('home');
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('An error occurred while rendering the page.');
    }
});

// CUSTOMERS
app.get('/customers', async function (req, res) {
    try {
        const query = `
            SELECT 
                customerID  AS "Customer ID",
                firstName   AS "First Name",
                lastName    AS "Last Name",
                email       AS "Email",
                phoneNumber AS "Phone Number",
                address1    AS "Address Line 1",
                address2    AS "Address Line 2",
                city        AS "City",
                state       AS "State",
                zipCode     AS "Zip Code"
            FROM Customers
            ORDER BY lastName, firstName;
        `;
        const [customers] = await db.query(query);
        res.render('customers', { customers });
    } catch (error) {
        console.error('Error loading customers:', error);
        res.status(500).send('An error occurred while loading customers.');
    }
});

app.get('/customers/new', async function (req, res) {
    try {
        res.render('newCustomer');
    } catch (error) {
        console.error('Error rendering new customer page:', error);
        res.status(500).send('An error occurred.');
    }
});

app.post('/customers', async function (req, res) {
    try {
        const {
            create_customer_fname,
            create_customer_lname,
            create_customer_email,
            create_customer_phone_number,
            create_customer_address_line1,
            create_customer_address_line2,
            create_customer_address_city,
            create_customer_address_state,
            create_customer_address_zipcode
        } = req.body;

        const query = `
            INSERT INTO Customers (
                firstName, lastName, email, phoneNumber,
                address1, address2, city, state, zipCode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        await db.query(query, [
            create_customer_fname,
            create_customer_lname,
            create_customer_email,
            nullIfEmpty(create_customer_phone_number),
            create_customer_address_line1,
            nullIfEmpty(create_customer_address_line2),
            create_customer_address_city,
            create_customer_address_state,
            create_customer_address_zipcode
        ]);

        res.redirect('/customers');
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).send('An error occurred while creating the customer.');
    }
});

app.get('/customers/:id/edit', async function (req, res) {
    try {
        const customerID = req.params.id;

        const query = `
            SELECT
                customerID  AS "Customer ID",
                firstName   AS "First Name",
                lastName    AS "Last Name",
                email       AS "Email",
                phoneNumber AS "Phone Number",
                address1    AS "Address Line 1",
                address2    AS "Address Line 2",
                city        AS "City",
                state       AS "State",
                zipCode     AS "Zip Code"
            FROM Customers
            WHERE customerID = ?;
        `;

        const [rows] = await db.query(query, [customerID]);

        if (rows.length === 0) {
            return res.status(404).send('Customer not found.');
        }

        res.render('editCustomer', { customer: rows[0] });
    } catch (error) {
        console.error('Error loading edit customer page:', error);
        res.status(500).send('An error occurred while loading the edit page.');
    }
});

app.post('/customers/:id', async function (req, res) {
    try {
        const customerID = req.params.id;

        const {
            update_customer_firstName,
            update_customer_lastName,
            update_customer_email,
            update_customer_phoneNumber,
            update_customer_address1,
            update_customer_address2,
            update_customer_city,
            update_customer_state,
            update_customer_zipCode
        } = req.body;

        const query = `
            UPDATE Customers
            SET firstName = ?,
                lastName = ?,
                email = ?,
                phoneNumber = ?,
                address1 = ?,
                address2 = ?,
                city = ?,
                state = ?,
                zipCode = ?
            WHERE customerID = ?;
        `;

        await db.query(query, [
            update_customer_firstName,
            update_customer_lastName,
            update_customer_email,
            nullIfEmpty(update_customer_phoneNumber),
            update_customer_address1,
            nullIfEmpty(update_customer_address2),
            update_customer_city,
            update_customer_state,
            update_customer_zipCode,
            customerID
        ]);

        res.redirect('/customers');
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).send('An error occurred while updating the customer.');
    }
});

app.post('/customers/:id/delete', async function (req, res) {
    try {
        const customerID = req.params.id;

        await db.query(
            `DELETE FROM Customers WHERE customerID = ?;`,
            [customerID]
        );

        res.redirect('/customers');
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).send('An error occurred while deleting the customer.');
    }
});

// SETS
app.get('/sets', async function (req, res) {
    try {
        const query = `
            SELECT 
                setID AS "Set ID",
                name AS "Set Name",
                description AS "Description",
                releaseDate AS "Release Date"
            FROM Sets
            ORDER BY setID ASC;
        `;

        const [sets] = await db.query(query);
        res.render('sets', { sets });
    } catch (error) {
        console.error('Error loading sets:', error);
        res.status(500).send('An error occurred while loading sets.');
    }
});

app.post('/sets/create', async function (req, res) {
    try {
        const { set_name, set_description, set_releaseDate } = req.body;

        const query = `
            INSERT INTO Sets (name, description, releaseDate)
            VALUES (?, ?, ?);
        `;

        await db.query(query, [
            set_name,
            nullIfEmpty(set_description),
            set_releaseDate
        ]);

        res.redirect('/sets');
    } catch (error) {
        console.error('Error creating set:', error);
        res.status(500).send('An error occurred while creating the set.');
    }
});

app.post('/sets/update', async function (req, res) {
    try {
        const {
            update_set_id,
            update_set_name,
            update_set_description,
            update_set_releaseDate
        } = req.body;

        const query = `
            UPDATE Sets
            SET name = ?, description = ?, releaseDate = ?
            WHERE setID = ?;
        `;

        await db.query(query, [
            update_set_name,
            nullIfEmpty(update_set_description),
            update_set_releaseDate,
            update_set_id
        ]);

        res.redirect('/sets');
    } catch (error) {
        console.error('Error updating set:', error);
        res.status(500).send('An error occurred while updating the set.');
    }
});

app.post('/sets/:id/delete', async function (req, res) {
    try {
        const setID = req.params.id;

        await db.query(`DELETE FROM Sets WHERE setID = ?;`, [setID]);

        res.redirect('/sets');
    } catch (error) {
        console.error('Error deleting set:', error);
        res.status(500).send('An error occurred while deleting the set.');
    }
});

// PRODUCTS
app.get('/products', async function (req, res) {
    try {
        const queryProducts = `
            SELECT
                productID AS "Product ID",
                productType AS "Product Type",
                setID AS "Set ID",
                name AS "Name",
                cardCondition AS "Card Condition",
                sku AS "SKU",
                price AS "Price",
                quantity AS "Quantity"
            FROM Products
            ORDER BY productID ASC;
        `;

        const querySets = `
            SELECT
                setID AS "Set ID",
                name AS "Name"
            FROM Sets
            ORDER BY setID ASC;
        `;

        const [products] = await db.query(queryProducts);
        const [sets] = await db.query(querySets);

        res.render('products', { products, sets });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('An error occurred while loading products.');
    }
});

app.post('/products/create', async function (req, res) {
    try {
        const {
            create_product_type,
            create_product_set_id,
            create_product_name,
            create_product_condition,
            create_product_sku,
            create_product_price,
            create_product_quantity
        } = req.body;

        const query = `
            INSERT INTO Products (
                productType, setID, name, cardCondition, sku, price, quantity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        await db.query(query, [
            create_product_type,
            create_product_set_id,
            create_product_name,
            nullIfEmpty(create_product_condition),
            nullIfEmpty(create_product_sku),
            create_product_price,
            create_product_quantity
        ]);

        res.redirect('/products');
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('An error occurred while creating the product.');
    }
});

app.post('/products/update', async function (req, res) {
    try {
        const {
            update_product_id,
            update_product_type,
            update_product_set_id,
            update_product_name,
            update_product_condition,
            update_product_sku,
            update_product_price,
            update_product_quantity
        } = req.body;

        const query = `
            UPDATE Products
            SET productType = ?,
                setID = ?,
                name = ?,
                cardCondition = ?,
                sku = ?,
                price = ?,
                quantity = ?
            WHERE productID = ?;
        `;

        await db.query(query, [
            update_product_type,
            update_product_set_id,
            update_product_name,
            nullIfEmpty(update_product_condition),
            nullIfEmpty(update_product_sku),
            update_product_price,
            update_product_quantity,
            update_product_id
        ]);

        res.redirect('/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('An error occurred while updating the product.');
    }
});

app.post('/products/:id/delete', async function (req, res) {
    try {
        const productID = req.params.id;

        await db.query(`DELETE FROM Products WHERE productID = ?;`, [productID]);

        res.redirect('/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('An error occurred while deleting the product.');
    }
});

// ORDERS
app.get('/orders', async function (req, res) {
    try {
        const queryOrders = `
            SELECT
                orderID AS "Order ID",
                customerID AS "Customer ID",
                orderNumber AS "Order Number",
                orderDate AS "Order Date",
                orderStatus AS "Order Status",
                grandTotal AS "Grand Total"
            FROM Orders
            ORDER BY orderID ASC;
        `;

        const queryCustomers = `
            SELECT
                customerID AS "Customer ID",
                firstName AS "First Name",
                lastName AS "Last Name"
            FROM Customers
            ORDER BY customerID ASC;
        `;

        const [orders] = await db.query(queryOrders);
        const [customers] = await db.query(queryCustomers);

        res.render('orders', { orders, customers });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('An error occurred while loading orders.');
    }
});

app.post('/orders/create', async function (req, res) {
    try {
        const {
            create_order_customer_id,
            create_order_number,
            create_order_date,
            create_order_status,
            create_order_grand_total
        } = req.body;

        const query = `
            INSERT INTO Orders (
                customerID, orderNumber, orderDate, orderStatus, grandTotal
            )
            VALUES (?, ?, ?, ?, ?);
        `;

        await db.query(query, [
            nullIfEmpty(create_order_customer_id),
            create_order_number,
            create_order_date,
            nullIfEmpty(create_order_status),
            create_order_grand_total
        ]);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('An error occurred while creating the order.');
    }
});

app.post('/orders/update', async function (req, res) {
    try {
        const {
            update_order_id,
            update_order_customer_id,
            update_order_number,
            update_order_date,
            update_order_status,
            update_order_grand_total
        } = req.body;

        const query = `
            UPDATE Orders
            SET customerID = ?,
                orderNumber = ?,
                orderDate = ?,
                orderStatus = ?,
                grandTotal = ?
            WHERE orderID = ?;
        `;

        await db.query(query, [
            nullIfEmpty(update_order_customer_id),
            update_order_number,
            update_order_date,
            nullIfEmpty(update_order_status),
            update_order_grand_total,
            update_order_id
        ]);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('An error occurred while updating the order.');
    }
});

app.post('/orders/:id/delete', async function (req, res) {
    try {
        const orderID = req.params.id;

        await db.query(`DELETE FROM Orders WHERE orderID = ?;`, [orderID]);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send('An error occurred while deleting the order.');
    }
});

// ORDER ITEMS
app.get('/orderItems', async function (req, res) {
    try {
        const queryOrderItems = `
            SELECT 
                orderItemID AS "Order Item ID",
                orderID AS "Order ID",
                productID AS "Product ID",
                unitPrice AS "Unit Price",
                quantity AS "Quantity",
                amount AS "Amount"
            FROM OrderItems
            ORDER BY orderItemID ASC;
        `;

        const queryOrders = `
            SELECT 
                orderID AS orderID,
                orderNumber AS orderNumber
            FROM Orders
            ORDER BY orderID ASC;
        `;

        const queryProducts = `
            SELECT
                productID AS "Product ID",
                name AS "Name"
            FROM Products
            ORDER BY productID ASC;
        `;

        const [orderItems] = await db.query(queryOrderItems);
        const [orders] = await db.query(queryOrders);
        const [products] = await db.query(queryProducts);

        res.render('orderItems', { orderItems, orders, products });
    } catch (error) {
        console.error('Error loading order items:', error);
        res.status(500).send('An error occurred while loading order items.');
    }
});

app.post('/create-order-item', async function (req, res) {
    try {
        const {
            create_order_item_order_id,
            create_order_item_product_id,
            create_order_item_unit_price,
            create_order_item_quantity,
            create_order_item_amount
        } = req.body;

        const query = `
            INSERT INTO OrderItems (
                orderID, productID, unitPrice, quantity, amount
            )
            VALUES (?, ?, ?, ?, ?);
        `;

        await db.query(query, [
            create_order_item_order_id,
            create_order_item_product_id,
            create_order_item_unit_price,
            create_order_item_quantity,
            create_order_item_amount
        ]);

        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error creating order item:', error);
        res.status(500).send('An error occurred while creating the order item.');
    }
});

app.post('/update-order-item', async function (req, res) {
    try {
        const {
            update_order_item_id,
            update_order_item_order_id,
            update_order_item_product_id,
            update_order_item_unit_price,
            update_order_item_quantity,
            update_order_item_amount
        } = req.body;

        const query = `
            UPDATE OrderItems
            SET orderID = ?,
                productID = ?,
                unitPrice = ?,
                quantity = ?,
                amount = ?
            WHERE orderItemID = ?;
        `;

        await db.query(query, [
            update_order_item_order_id,
            update_order_item_product_id,
            update_order_item_unit_price,
            update_order_item_quantity,
            update_order_item_amount,
            update_order_item_id
        ]);

        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error updating order item:', error);
        res.status(500).send('An error occurred while updating the order item.');
    }
});

app.post('/delete-order-item', async function (req, res) {
    try {
        const { delete_order_item_id } = req.body;

        await db.query(
            `DELETE FROM OrderItems WHERE orderItemID = ?;`,
            [delete_order_item_id]
        );

        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error deleting order item:', error);
        res.status(500).send('An error occurred while deleting the order item.');
    }
});

// PAYMENTS
app.get('/payments', async function (req, res) {
    try {
        const queryPayments = `
            SELECT 
                paymentID AS "Payment ID",
                orderID AS "Order ID",
                paymentNumber AS "Payment Number",
                paymentMethod AS "Payment Method",
                amount AS "Amount",
                paymentDate AS "Payment Date"
            FROM Payments
            ORDER BY paymentID ASC;
        `;

        const queryOrders = `
            SELECT 
                orderID AS "Order ID",
                orderNumber AS "Order Number"
            FROM Orders
            ORDER BY orderID ASC;
        `;

        const [payments] = await db.query(queryPayments);
        const [orders] = await db.query(queryOrders);

        res.render('payments', { payments, orders });
    } catch (error) {
        console.error('Error loading payments:', error);
        res.status(500).send('An error occurred while loading payments.');
    }
});

app.post('/payments/create', async function (req, res) {
    try {
        const {
            create_payment_order_id,
            create_payment_number,
            create_payment_method,
            create_payment_amount,
            create_payment_date
        } = req.body;

        const query = `
            INSERT INTO Payments (
                orderID, paymentNumber, paymentMethod, amount, paymentDate
            )
            VALUES (?, ?, ?, ?, ?);
        `;

        await db.query(query, [
            create_payment_order_id,
            create_payment_number,
            create_payment_method,
            create_payment_amount,
            create_payment_date
        ]);

        res.redirect('/payments');
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).send('An error occurred while creating the payment.');
    }
});

app.post('/payments/update', async function (req, res) {
    try {
        const {
            update_payment_id,
            update_payment_order_id,
            update_payment_number,
            update_payment_method,
            update_payment_amount,
            update_payment_date
        } = req.body;

        const query = `
            UPDATE Payments
            SET orderID = ?,
                paymentNumber = ?,
                paymentMethod = ?,
                amount = ?,
                paymentDate = ?
            WHERE paymentID = ?;
        `;

        await db.query(query, [
            update_payment_order_id,
            update_payment_number,
            update_payment_method,
            update_payment_amount,
            update_payment_date,
            update_payment_id
        ]);

        res.redirect('/payments');
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).send('An error occurred while updating the payment.');
    }
});

app.post('/payments/:id/delete', async function (req, res) {
    try {
        const paymentID = req.params.id;

        await db.query(`DELETE FROM Payments WHERE paymentID = ?;`, [paymentID]);

        res.redirect('/payments');
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).send('An error occurred while deleting the payment.');
    }
});

// RESET
app.get('/reset', async function (req, res) {
    try {
        await db.query('CALL ResetManaVault();');
        res.redirect('/home');
    } catch (error) {
        console.error('RESET failed:', error);
        res.status(500).send('RESET failed. Check server logs.');
    }
});

// LISTENER
app.listen(PORT, function () {
    console.log(`Express started on port ${PORT}; press Ctrl-C to terminate.`);
});