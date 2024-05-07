import mysql from 'mysql';
import 'dotenv/config';

const config = {
    host: process.env.DB_HOST,
    port: '1433',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'sakila',
};

console.log(config);

let connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

connection.query('SELECT * from actors LIMIT 3', (error, rows, fields) => {
    if (error) {
        console.log(error);
    } else {
        console.dir(rows);
    }
});

connection.end();