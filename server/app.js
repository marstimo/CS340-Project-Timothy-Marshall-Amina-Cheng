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
app.get('/home', async function (req, res) {
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

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(`Express started on port ${PORT}; press Ctrl-C to terminate.`);
});
