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
// Customers
app.get('/customers', async function (req, res) {
    try {
        // Create and execute our queries
        // In query1, we use a JOIN clause to display the names of the homeworlds
        const queryReadCustomer = 
        `SELECT customerID, firstName, lastName, email, phoneNumber, \
            address1, address2, city, state, zipCode FROM Customers \
            ORDER BY lastName, firstName;`;
        // `SELECT bsg_people.id, bsg_people.fname, bsg_people.lname, \
        //     bsg_planets.name AS 'homeworld', bsg_people.age FROM bsg_people \
        //     LEFT JOIN bsg_planets ON bsg_people.homeworld = bsg_planets.id;`;
        // const query2 = 'SELECT * FROM bsg_planets;';
        const [customers] = await db.query(queryReadCustomer);
        // const [homeworlds] = await db.query(query2);

        // Render the bsg-people.hbs file, and also send the renderer
        //  an object that contains our bsg_people and bsg_homeworld information
        res.render('customers', { customers: customers });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// OrderItems
app.get('/orderItems', async function (req, res) {
    try {
        // OrderItems rows
        const queryOrderItems = `
            SELECT 
                OrderItems.orderItemID,
                OrderItems.orderID,
                OrderItems.productID,
                OrderItems.unitPrice,
                OrderItems.quantity,
                OrderItems.amount
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
                setID,
                name,
                description,
                releaseDate
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
                paymentID,
                orderID,
                paymentNumber,
                paymentMethod,
                amount,
                paymentDate
            FROM Payments
            ORDER BY paymentID ASC;
        `;

        const queryOrders = `
            SELECT 
                orderID,
                orderNumber
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
                productID,
                productType,
                setID,
                name,
                cardCondition,
                sku,
                price,
                quantity
            FROM Products
            ORDER BY productID ASC;
        `;

        const querySets = `
            SELECT
                setID,
                name
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
                orderID,
                customerID,
                orderNumber,
                orderDate,
                orderStatus,
                grandTotal
            FROM Orders
            ORDER BY orderID ASC;
        `;

        const queryCustomers = `
            SELECT
                customerID,
                firstName,
                lastName
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
