/*
ManaVault Inventory Manager - CS340 Portfolio Project
Team: Amina Cheng, Timothy Marshall

Citation / Originality Statement:
This file was developed by the team for the CS340 portfolio project.
The overall Express/Handlebars application structure was adapted from course starter patterns,
but the project-specific routes, stored procedure calls, UI data formatting, and page behavior
were implemented and revised by the team.
AI tools were used for brainstorming, debugging help, syntax cleanup, and requirement alignment.
All final logic and testing should be verified by the team.
*/

const express = require('express');
const { engine } = require('express-handlebars');
const db = require('./database/db-connector');

const app = express();
const PORT = process.env.PORT || 7777;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

function nullIfEmpty(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

function toDisplayCurrency(value) {
    return value === null || value === undefined ? '' : Number(value).toFixed(2);
}

// HOME
app.get(['/', '/home'], async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('An error occurred while rendering the page.');
    }
});

// CUSTOMERS
app.get('/customers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                customerID,
                firstName,
                lastName,
                email,
                COALESCE(phoneNumber, '') AS phoneNumber,
                address1,
                COALESCE(address2, '') AS address2,
                city,
                state,
                zipCode
            FROM Customers
            ORDER BY lastName, firstName;
        `);

        const customers = rows.map(r => ({
            'Customer ID': r.customerID,
            'First Name': r.firstName,
            'Last Name': r.lastName,
            'Email': r.email,
            'Phone Number': r.phoneNumber,
            'Address Line 1': r.address1,
            'Address Line 2': r.address2,
            'City': r.city,
            'State': r.state,
            'Zip Code': r.zipCode
        }));

        const customerOptions = rows.map(r => ({
            customerID: r.customerID,
            customerLabel: `${r.firstName} ${r.lastName} (${r.email})`
        }));

        res.render('customers', {
            customers,
            customerOptions,
            customerRecordsJson: JSON.stringify(rows)
        });
    } catch (error) {
        console.error('Error loading customers:', error);
        res.status(500).send('An error occurred while loading customers.');
    }
});

app.post('/customers/create', async (req, res) => {
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

        await db.query(
            `CALL CreateCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                create_customer_fname,
                create_customer_lname,
                create_customer_email,
                nullIfEmpty(create_customer_phone_number),
                create_customer_address_line1,
                nullIfEmpty(create_customer_address_line2),
                create_customer_address_city,
                create_customer_address_state,
                create_customer_address_zipcode
            ]
        );

        res.redirect('/customers');
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).send('An error occurred while creating the customer.');
    }
});

app.post('/customers/update', async (req, res) => {
    try {
        const {
            update_customer_id,
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

        await db.query(
            `CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                update_customer_id,
                update_customer_firstName,
                update_customer_lastName,
                update_customer_email,
                nullIfEmpty(update_customer_phoneNumber),
                update_customer_address1,
                nullIfEmpty(update_customer_address2),
                update_customer_city,
                update_customer_state,
                update_customer_zipCode
            ]
        );

        res.redirect('/customers');
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).send('An error occurred while updating the customer.');
    }
});

app.post('/customers/:id/delete', async (req, res) => {
    try {
        await db.query(`CALL DeleteCustomer(?);`, [req.params.id]);
        res.redirect('/customers');
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).send('An error occurred while deleting the customer.');
    }
});

// SETS
app.get('/sets', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                setID,
                name,
                COALESCE(description, '') AS description,
                DATE_FORMAT(releaseDate, '%Y-%m-%d') AS releaseDate
            FROM Sets
            ORDER BY releaseDate DESC, name;
        `);

        const sets = rows.map(r => ({
            'Set ID': r.setID,
            'Set Name': r.name,
            'Description': r.description,
            'Release Date': r.releaseDate
        }));

        const setOptions = rows.map(r => ({
            setID: r.setID,
            setLabel: r.name
        }));

        res.render('sets', {
            sets,
            setOptions,
            setRecordsJson: JSON.stringify(rows)
        });
    } catch (error) {
        console.error('Error loading sets:', error);
        res.status(500).send('An error occurred while loading sets.');
    }
});

app.post('/sets/create', async (req, res) => {
    try {
        const { set_name, set_description, set_releaseDate } = req.body;

        await db.query(`CALL CreateSetRecord(?, ?, ?);`, [
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

app.post('/sets/update', async (req, res) => {
    try {
        const {
            update_set_id,
            update_set_name,
            update_set_description,
            update_set_releaseDate
        } = req.body;

        await db.query(`CALL UpdateSetRecord(?, ?, ?, ?);`, [
            update_set_id,
            update_set_name,
            nullIfEmpty(update_set_description),
            update_set_releaseDate
        ]);

        res.redirect('/sets');
    } catch (error) {
        console.error('Error updating set:', error);
        res.status(500).send('An error occurred while updating the set.');
    }
});

app.post('/sets/:id/delete', async (req, res) => {
    try {
        await db.query(`CALL DeleteSetRecord(?);`, [req.params.id]);
        res.redirect('/sets');
    } catch (error) {
        console.error('Error deleting set:', error);
        res.status(500).send('An error occurred while deleting the set.');
    }
});

// PRODUCTS
app.get('/products', async (req, res) => {
    try {
        const [productRows] = await db.query(`
            SELECT
                p.productID,
                p.productType,
                p.setID,
                s.name AS setName,
                p.name,
                COALESCE(p.cardCondition, '') AS cardCondition,
                COALESCE(p.sku, '') AS sku,
                p.price,
                p.quantity
            FROM Products p
            JOIN Sets s ON p.setID = s.setID
            ORDER BY p.productType, s.name, p.name;
        `);

        const [setRows] = await db.query(`
            SELECT
                setID,
                name
            FROM Sets
            ORDER BY name;
        `);

        const products = productRows.map(r => ({
            'Product ID': r.productID,
            'Product Type': r.productType,
            'Set': r.setName,
            'Name': r.name,
            'Card Condition': r.cardCondition,
            'SKU': r.sku,
            'Price': toDisplayCurrency(r.price),
            'Quantity': r.quantity
        }));

        const setOptions = setRows.map(r => ({
            setID: r.setID,
            setLabel: r.name
        }));

        const productOptions = productRows.map(r => ({
            productID: r.productID,
            productLabel: `${r.name} (${r.productType})`
        }));

        res.render('products', {
            products,
            setOptions,
            productOptions,
            productRecordsJson: JSON.stringify(productRows)
        });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('An error occurred while loading products.');
    }
});

app.post('/products/create', async (req, res) => {
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

        await db.query(`CALL CreateProduct(?, ?, ?, ?, ?, ?, ?);`, [
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

app.post('/products/update', async (req, res) => {
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

        await db.query(`CALL UpdateProduct(?, ?, ?, ?, ?, ?, ?, ?);`, [
            update_product_id,
            update_product_type,
            update_product_set_id,
            update_product_name,
            nullIfEmpty(update_product_condition),
            nullIfEmpty(update_product_sku),
            update_product_price,
            update_product_quantity
        ]);

        res.redirect('/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('An error occurred while updating the product.');
    }
});

app.post('/products/:id/delete', async (req, res) => {
    try {
        await db.query(`CALL DeleteProduct(?);`, [req.params.id]);
        res.redirect('/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('An error occurred while deleting the product.');
    }
});

// ORDERS
app.get('/orders', async (req, res) => {
    try {
        const [orderRows] = await db.query(`
            SELECT
                o.orderID,
                o.customerID,
                COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest') AS customerName,
                o.orderNumber,
                DATE_FORMAT(o.orderDate, '%Y-%m-%d %H:%i') AS orderDateDisplay,
                DATE_FORMAT(o.orderDate, '%Y-%m-%dT%H:%i') AS orderDateInput,
                o.orderStatus,
                o.grandTotal,
                CONCAT(
                    'Order #', o.orderID,
                    ' - ',
                    COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
                    ' - ',
                    DATE_FORMAT(o.orderDate, '%Y-%m-%d')
                ) AS orderLabel
            FROM Orders o
            LEFT JOIN Customers c ON o.customerID = c.customerID
            ORDER BY o.orderDate DESC, o.orderID DESC;
        `);

        const [customerRows] = await db.query(`
            SELECT
                customerID,
                CONCAT(firstName, ' ', lastName, ' (', email, ')') AS customerLabel
            FROM Customers
            ORDER BY lastName, firstName;
        `);

        const orders = orderRows.map(r => ({
            'Order ID': r.orderID,
            'Customer': r.customerName,
            'Order Number': r.orderNumber,
            'Order Date': r.orderDateDisplay,
            'Order Status': r.orderStatus,
            'Grand Total': toDisplayCurrency(r.grandTotal)
        }));

        res.render('orders', {
            orders,
            customerOptions: customerRows,
            orderOptions: orderRows.map(r => ({
                orderID: r.orderID,
                orderLabel: r.orderLabel
            })),
            orderRecordsJson: JSON.stringify(orderRows)
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('An error occurred while loading orders.');
    }
});

app.post('/orders/create', async (req, res) => {
    try {
        const {
            create_order_customer_id,
            create_order_date,
            create_order_status,
            create_order_grand_total
        } = req.body;

        await db.query(`CALL CreateOrderRecord(?, ?, ?, ?);`, [
            nullIfEmpty(create_order_customer_id),
            create_order_date,
            create_order_status,
            create_order_grand_total
        ]);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('An error occurred while creating the order.');
    }
});

app.post('/orders/update', async (req, res) => {
    try {
        const {
            update_order_id,
            update_order_customer_id,
            update_order_date,
            update_order_status,
            update_order_grand_total
        } = req.body;

        await db.query(`CALL UpdateOrderRecord(?, ?, ?, ?, ?);`, [
            update_order_id,
            nullIfEmpty(update_order_customer_id),
            update_order_date,
            update_order_status,
            update_order_grand_total
        ]);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('An error occurred while updating the order.');
    }
});

app.post('/orders/:id/delete', async (req, res) => {
    try {
        await db.query(`CALL DeleteOrderRecord(?);`, [req.params.id]);
        res.redirect('/orders');
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send('An error occurred while deleting the order.');
    }
});

// ORDER ITEMS
app.get('/orderItems', async (req, res) => {
    try {
        const [orderItemRows] = await db.query(`
            SELECT
                oi.orderItemID,
                oi.orderID,
                oi.productID,
                oi.unitPrice,
                oi.quantity,
                oi.amount,
                CONCAT(
                    'Order #', o.orderID,
                    ' - ',
                    COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
                    ' - ',
                    DATE_FORMAT(o.orderDate, '%Y-%m-%d')
                ) AS orderLabel,
                CONCAT(p.name, ' ($', FORMAT(p.price, 2), ')') AS productLabel
            FROM OrderItems oi
            JOIN Orders o ON oi.orderID = o.orderID
            LEFT JOIN Customers c ON o.customerID = c.customerID
            JOIN Products p ON oi.productID = p.productID
            ORDER BY oi.orderItemID ASC;
        `);

        const [orderRows] = await db.query(`
            SELECT
                o.orderID,
                CONCAT(
                    'Order #', o.orderID,
                    ' - ',
                    COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
                    ' - ',
                    DATE_FORMAT(o.orderDate, '%Y-%m-%d')
                ) AS orderLabel
            FROM Orders o
            LEFT JOIN Customers c ON o.customerID = c.customerID
            ORDER BY o.orderDate DESC, o.orderID DESC;
        `);

        const [productRows] = await db.query(`
            SELECT
                productID,
                name,
                price,
                CONCAT(name, ' ($', FORMAT(price, 2), ')') AS productLabel
            FROM Products
            ORDER BY name;
        `);

        const orderItems = orderItemRows.map(r => ({
            'Order Item ID': r.orderItemID,
            'Order': r.orderLabel,
            'Product': r.productLabel,
            'Unit Price': toDisplayCurrency(r.unitPrice),
            'Quantity': r.quantity,
            'Amount': toDisplayCurrency(r.amount)
        }));

        res.render('orderItems', {
            orderItems,
            orderOptions: orderRows,
            productOptions: productRows,
            orderItemRecordsJson: JSON.stringify(orderItemRows),
            productRecordsJson: JSON.stringify(productRows)
        });
    } catch (error) {
        console.error('Error loading order items:', error);
        res.status(500).send('An error occurred while loading order items.');
    }
});

app.post('/orderItems/create', async (req, res) => {
    try {
        const {
            create_order_item_order_id,
            create_order_item_product_id,
            create_order_item_unit_price,
            create_order_item_quantity
        } = req.body;

        await db.query(`CALL CreateOrderItem(?, ?, ?, ?);`, [
            create_order_item_order_id,
            create_order_item_product_id,
            create_order_item_unit_price,
            create_order_item_quantity
        ]);

        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error creating order item:', error);
        res.status(500).send('An error occurred while creating the order item.');
    }
});

app.post('/orderItems/update', async (req, res) => {
    try {
        const {
            update_order_item_id,
            update_order_item_order_id,
            update_order_item_product_id,
            update_order_item_unit_price,
            update_order_item_quantity
        } = req.body;

        await db.query(`CALL UpdateOrderItem(?, ?, ?, ?, ?);`, [
            update_order_item_id,
            update_order_item_order_id,
            update_order_item_product_id,
            update_order_item_unit_price,
            update_order_item_quantity
        ]);

        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error updating order item:', error);
        res.status(500).send('An error occurred while updating the order item.');
    }
});

app.post('/orderItems/delete', async (req, res) => {
    try {
        const { delete_order_item_id } = req.body;
        await db.query(`CALL DeleteOrderItem(?);`, [delete_order_item_id]);
        res.redirect('/orderItems');
    } catch (error) {
        console.error('Error deleting order item:', error);
        res.status(500).send('An error occurred while deleting the order item.');
    }
});

// PAYMENTS
app.get('/payments', async (req, res) => {
    try {
        const [paymentRows] = await db.query(`
            SELECT
                p.paymentID,
                p.orderID,
                p.paymentNumber,
                p.paymentMethod,
                p.amount,
                DATE_FORMAT(p.paymentDate, '%Y-%m-%d %H:%i') AS paymentDateDisplay,
                DATE_FORMAT(p.paymentDate, '%Y-%m-%dT%H:%i') AS paymentDateInput,
                CONCAT(
                    'Order #', o.orderID,
                    ' - ',
                    COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
                    ' - ',
                    DATE_FORMAT(o.orderDate, '%Y-%m-%d')
                ) AS orderLabel
            FROM Payments p
            JOIN Orders o ON p.orderID = o.orderID
            LEFT JOIN Customers c ON o.customerID = c.customerID
            ORDER BY p.paymentDate DESC;
        `);

        const [orderRows] = await db.query(`
            SELECT
                o.orderID,
                CONCAT(
                    'Order #', o.orderID,
                    ' - ',
                    COALESCE(CONCAT(c.firstName, ' ', c.lastName), 'Guest'),
                    ' - ',
                    DATE_FORMAT(o.orderDate, '%Y-%m-%d')
                ) AS orderLabel
            FROM Orders o
            LEFT JOIN Customers c ON o.customerID = c.customerID
            ORDER BY o.orderDate DESC, o.orderID DESC;
        `);

        const payments = paymentRows.map(r => ({
            'Payment ID': r.paymentID,
            'Order': r.orderLabel,
            'Payment Number': r.paymentNumber,
            'Payment Method': r.paymentMethod,
            'Amount': toDisplayCurrency(r.amount),
            'Payment Date': r.paymentDateDisplay
        }));

        res.render('payments', {
            payments,
            orderOptions: orderRows,
            paymentOptions: paymentRows.map(r => ({
                paymentID: r.paymentID,
                paymentLabel: `${r.paymentNumber} - ${r.orderLabel}`
            })),
            paymentRecordsJson: JSON.stringify(paymentRows)
        });
    } catch (error) {
        console.error('Error loading payments:', error);
        res.status(500).send('An error occurred while loading payments.');
    }
});

app.post('/payments/create', async (req, res) => {
    try {
        const {
            create_payment_order_id,
            create_payment_number,
            create_payment_method,
            create_payment_amount,
            create_payment_date
        } = req.body;

        await db.query(`CALL CreatePayment(?, ?, ?, ?, ?);`, [
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

app.post('/payments/update', async (req, res) => {
    try {
        const {
            update_payment_id,
            update_payment_order_id,
            update_payment_number,
            update_payment_method,
            update_payment_amount,
            update_payment_date
        } = req.body;

        await db.query(`CALL UpdatePayment(?, ?, ?, ?, ?, ?);`, [
            update_payment_id,
            update_payment_order_id,
            update_payment_number,
            update_payment_method,
            update_payment_amount,
            update_payment_date
        ]);

        res.redirect('/payments');
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).send('An error occurred while updating the payment.');
    }
});

app.post('/payments/:id/delete', async (req, res) => {
    try {
        await db.query(`CALL DeletePayment(?);`, [req.params.id]);
        res.redirect('/payments');
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).send('An error occurred while deleting the payment.');
    }
});

// RESET
app.get('/reset', async (req, res) => {
    try {
        await db.query(`CALL ResetManaVault();`);
        res.redirect('/home');
    } catch (error) {
        console.error('RESET failed:', error);
        res.status(500).send('RESET failed. Check server logs.');
    }
});

app.listen(PORT, () => {
    console.log(`Express started on port ${PORT}`);
});