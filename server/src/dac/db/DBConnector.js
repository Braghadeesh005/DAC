import mysql2 from 'mysql2';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';

require("dotenv").config();
class DBConnector {
    static connect() {
        try {
            const connection = mysql2.createConnection({
                host: process.env.MACHINE_IP,
                user: process.env.DB_USER,
                password: process.env.MACHINE_PASS,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME
            });
            connection.connect((err) => {
                if (err) {
                    DacLogger.log(Level.ERROR,"[DBConnector] Connection failed: " + err);
                    throw err;
                }
                DacLogger.log(Level.INFO,`[DBConnector] Connection Object Created.`);
            });
            return connection;
        } catch (error) {
            DacLogger.log(Level.ERROR,"[DBConnector] Unexpected error: " + error);
            throw error;
        }
    }
}

export default DBConnector;
