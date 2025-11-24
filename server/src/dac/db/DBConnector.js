import mysql2 from 'mysql2';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import dotenv from 'dotenv';
import User from '../conf/User.js';
dotenv.config({ path: "./config-properties.env" });
const LOGGER = new DacLogger("DBConnector.js");

class DBConnector {
    static connect() {
        try {
            const connection = mysql2.createConnection({
                host: process.env.MACHINE_IP,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME
            });
            connection.connect((err) => {
                if (err) {
                    LOGGER.log(Level.ERROR,`[DBConnector] Connection failed: ${err.message}`, User.DAC, err);
                    throw err;
                }
                LOGGER.log(Level.INFO,`[DBConnector] Connection Object Created.`);
            });
            return connection;
        } catch (error) {
            LOGGER.log(Level.ERROR,`[DBConnector] Unexpected error: ${err.message}`, User.DAC, err);
            throw error;
        }
    }
}

export default DBConnector;
