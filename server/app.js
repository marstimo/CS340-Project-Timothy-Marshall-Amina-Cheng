// Express
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 7777;


// Database
const db = require('./database/db-connector');


// Handlebars
const { engine } = require('express-handlebars'); // Import express-handlebars engine
app.engine('.hbs', engine({ extname: '.hbs' })); // Create instance of handlebars
app.set('view engine', '.hbs'); // Use handlebars engine for *.hbs files.


// READ ROUTES
app.get('/', async function (req, res) {
    try {
        res.render('home'); // Render the home.hbs file
    } catch (error) {
        console.error('Error rendering page:', error);
        // Send a generic error message to the browser
        res.status(500).send('An error occurred while rendering the page.');
    }
});


// Home
app.get('/home', async function (req, res) {
    try {
        res.render('home'); // Render the home.hbs file
    } catch (error) {
        console.error('Error rendering page:', error);
        // Send a generic error message to the browser
        res.status(500).send('An error occurred while rendering the page.');
    }
});


// Read Customers
app.get('/customers', async function (req, res) {
    try {
        const queryReadCustomer = `
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
        const [customers] = await db.query(queryReadCustomer);

        res.render('customers', { customers: customers });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Render Add Customer Page
app.get('/customers/new', async function (req, res) {
    try {
        res.render('addCustomer');  // make sure file is addCustomer.hbs
    } catch (error) {
        console.error('Error rendering Add Customer page:', error);
        res.status(500).send('An error occurred.');
    }
});


// Create Customer
app.post('/customers', async function (req, res) {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            address1,
            address2,
            city,
            state,
            zipCode
        } = req.body;

        const queryInsertCustomer = `
            INSERT INTO Customers(
                firstName,
                lastName,
                email,
                phoneNumber,
                address1,
                address2,
                city,
                state,
                zipCode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        await db.query(queryInsertCustomer, [
            firstName,
            lastName,
            email,
            phoneNumber,
            address1,
            address2,
            city,
            state,
            zipCode
        ]);

        res.redirect('/customers');

    } catch (error) {
        console.error('Error inserting customer:', error);
        res.status(500).send('An error occurred while inserting the customer.');
    }
});


// Render Edit Customer Page (preloaded for that customer)
app.get('/customers/:id/edit', async function (req, res) {
    try {
        const customerID = req.params.id;

        const queryGetOneCustomer = `
            SELECT
                customerID  AS "Customer ID",
                firstName   AS "First Name",
                lastName    AS "Last Name",
                email       AS "Email",
                phoneNumber AS "Phone Number",
                line1       AS "Address Line 1",
                line2       AS "Address Line 2",
                city        AS "City",
                state       AS "State",
                zipCode     AS "Zip Code"
            FROM Customers
            WHERE customerID = ?;
        `;

        const [rows] = await db.query(queryGetOneCustomer, [customerID]);

        if (rows.length === 0) {
            return res.status(404).send('Customer not found.');
        }

        // IMPORTANT: editCustomer.hbs should use {{customer.firstName}} etc.
        res.render('editCustomer', { customer: rows[0] });

    } catch (error) {
        console.error('Error rendering Edit Customer page:', error);
        res.status(500).send('An error occurred while loading the edit page.');
    }
});


// Update Customer (Save Changes)
app.post('/customers/:id', async function (req, res) {
    try {
        const customerID = req.params.id;

        const {
            update_customer_firstName,
            update_customer_lastName,
            update_customer_email,
            update_customer_phoneNumber,
            update_customer_line1,
            update_customer_line2,
            update_customer_city,
            update_customer_state,
            update_customer_zipCode
        } = req.body;

        const queryUpdateCustomer = `
            UPDATE Customers
            SET firstName = ?,
                lastName = ?,
                email = ?,
                phoneNumber = ?,
                line1 = ?,
                line2 = ?,
                city = ?,
                state = ?,
                zipCode = ?
            WHERE customerID = ?;
        `;

        await db.query(queryUpdateCustomer, [
            update_customer_firstName,
            update_customer_lastName,
            update_customer_email,
            update_customer_phoneNumber,
            update_customer_line1,
            update_customer_line2,
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


// OrderItems
app.get('/orderItems', async function (req, res) {
    try {
        // OrderItems rows
        const queryOrderItems = `
            SELECT 
                OrderItems.orderItemID AS "Order Item ID",
                OrderItems.orderID     AS "Order ID",
                OrderItems.productID   AS "Product ID",
                OrderItems.unitPrice   AS "Unit Price",
                OrderItems.quantity    AS "Quantity",
                OrderItems.amount      AS "Amount"
            FROM OrderItems
            ORDER BY OrderItems.orderItemID ASC;
        `;

        // Orders for dropdown
        const queryOrders = `
            SELECT 
                Orders.orderID,
                Orders.orderNumber
            FROM Orders
            ORDER BY Orders.orderID ASC;
        `;

        // Products for dropdown
        const queryProducts = `
            SELECT
                Products.productID,
                Products.name
            FROM Products
            ORDER BY Products.productID ASC;
        `;

        const [orderItems] = await db.query(queryOrderItems);
        const [orders] = await db.query(queryOrders);
        const [products] = await db.query(queryProducts);

        res.render('orderItems', {
            orderItems: orderItems,
            orders: orders,
            products: products,
        });
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Sets
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

        res.render('sets', { sets: sets });
    } catch (error) {
        console.error('Error executing Sets query:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Payments
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

        res.render('payments', { payments: payments, orders: orders });
    } catch (error) {
        console.error('Error executing Payments query:', error);
        res.status(500).send('An error occurred while executing the database queries.');
    }
});


// Products
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

        res.render('products', {
            products: products,
            sets: sets
        });
    } catch (error) {
        console.error('Error executing Products query:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Orders
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

        res.render('orders', {
            orders: orders,
            customers: customers
        });
    } catch (error) {
        console.error('Error executing Orders query:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(`Express started on port ${PORT}; press Ctrl-C to terminate.`);
});
