import mysql2 from 'mysql2';
import DacLogger from './DacLogger';
import Properties from '../conf/Properties.js';

const MACHINE_IP = 'localhost';
const MACHINE_PASS = 'abcd1234';
const DB_USER = 'root';
const DB_PORT = 3306;
const DB_NAME = 'dacdb';

class DBConnector {
    static connect() {
        try {
            const connection = mysql2.createConnection({
                host: MACHINE_IP,
                user: DB_USER,
                password: MACHINE_PASS,
                port: DB_PORT,
                database: DB_NAME
            });
            connection.connect((err) => {
                if (err) {
                    DacLogger.log(Properties.ERROR,"[DBConnector] Connection failed: " + err);
                    throw err;
                }
                DacLogger.log(Properties.INFO,`[DBConnector] Connected to database '${DB_NAME}'`);
            });
            return connection;
        } catch (error) {
            DacLogger.log(Properties.ERROR,"[DBConnector] Unexpected error: " + error);
            throw error;
        }
    }
}

export default DBConnector;