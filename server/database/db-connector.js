let mysql = require('mysql2')

const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit   : 10,
    host              : 'classmysql.engr.oregonstate.edu',
<<<<<<< HEAD
    user              : 'cs340_marstimo',
    password          : 'SjjPxu1E27g2',
    database          : 'cs340_marstimo'
}).promise();
=======
    user              : 'cs340_chengam',
    password          : 8525,
    database          : 'cs340_chengam'
}).promise(); // This makes it so we can use async / await rather than callbacks
>>>>>>> a61dfa2b98d15b16ef1c39fe329a5428a7845469

module.exports = pool;