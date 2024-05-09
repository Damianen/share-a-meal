import mysql from 'mysql2';
import logger from '../logger.js';
import 'dotenv/config'

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};

logger.trace(config);

const pool = mysql.createPool(config);

pool.on('connection', function (connection) {
    logger.trace(
        `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
    );
});

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId);
});

export default pool;
