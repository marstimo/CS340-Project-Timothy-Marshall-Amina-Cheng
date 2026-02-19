let mysql = require('mysql2')

const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit   : 10,
    host              : 'classmysql.engr.oregonstate.edu',
    // user              : 'cs340_marstimo',
    // password          : 'SjjPxu1E27g2',
    // database          : 'cs340_marstimo'
    user              : 'cs340_chengam',
    password          : '8525',
    database          : 'cs340_chengam'
}).promise();


module.exports = pool;