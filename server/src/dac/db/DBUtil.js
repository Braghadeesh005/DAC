import DBConnector from '../util/DBConnector.js';
import DacLogger from '../util/DacLogger.js';
import Properties from '../conf/Properties.js'

class DBUtil {

    static async runQuery(sqlQuery, resultHandler, operation) {
        let connection;
        try {
            DacLogger.log(Properties.INFO, `Executing ${operation} for query: ${sqlQuery}`);
            connection = DBConnector.connect();
            return await new Promise((resolve, reject) => {
                connection.query(sqlQuery, (err, result) => {
                    if (err) {
                        DacLogger.log(Properties.ERROR, `Error in ${operation}: ${err.stack}`);
                        reject(err);
                    } else {
                        const result = resultHandler(result);
                        DacLogger.log(Properties.FINE, `${operation} executed successfully.`);
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            DacLogger.log(Properties.ERROR, `Exception in ${operation}: ${error.stack}`);
            throw error;
        } finally {
            if (connection) connection.end();
        }
    }

    static async getResults(sqlQuery) {
        return await DBUtil.runQuery(sqlQuery, result => {
            DacLogger.log(Properties.INFO, `getResults returned ${result.length} rows.`);
            return result;
        }, 'getResults');
    }

    static async hasResults(sqlQuery) {
        return await DBUtil.runQuery(sqlQuery, result => {
            const has = result.length > 0;
            DacLogger.log(Properties.INFO, `hasResults returned ${has}`);
            return has;
        }, 'hasResults');
    }

    static async executeUpdate(sqlQuery) {
        return await DBUtil.runQuery(sqlQuery, result => {
            DacLogger.log(Properties.INFO, `executeUpdate affected ${result.affectedRows} rows.`);
            return result.affectedRows;
        }, 'executeUpdate');
    }
}

export default DBUtil;