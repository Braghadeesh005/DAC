import DBConnector from './DBConnector.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js'
import DacUtil from '../util/DacUtil.js';
import User from '../conf/User.js';
const LOGGER = new DacLogger("DBUtil.js");

class DBUtil {

    static async _runQuery(sqlQuery, resultHandler, operation) {
        let connection;
        try {
            connection = DBConnector.connect();
            return await new Promise((resolve, reject) => {
                connection.query(sqlQuery, (err, result) => {
                    if (err) {
                        LOGGER.log(Level.ERROR, `Error in ${operation} : ${err.message}`, User.DAC, err);
                        reject(err);
                    } else {
                        const finalResult = resultHandler(result);
                        LOGGER.log(Level.FINE, `${operation} executed successfully.`);
                        resolve(finalResult);
                    }
                });
            });
        } catch (error) {
            LOGGER.log(Level.ERROR, `Exception in ${operation} : ${err.message}`, User.DAC, err);
            throw error;
        } finally {
            if (connection) connection.end();
        }
    }

    static async getResults(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            LOGGER.log(Level.INFO, `getResults returned ${result.length} rows.`);
            return result;
        }, 'getResults');
    }

    static async hasResults(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            const has = result.length > 0;
            LOGGER.log(Level.INFO, `hasResults returned ${has}`);
            return has;
        }, 'hasResults');
    }

    static async executeUpdate(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            LOGGER.log(Level.INFO, `executeUpdate affected ${result.affectedRows} rows.`);
            return result.affectedRows;
        }, 'executeUpdate');
    }

    static async getCount(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            LOGGER.log(Level.INFO, `getCount returned ${result[0] ? Object.values(result[0])[0] : 0} rows.`);
            return result[0] ? Object.values(result[0])[0] : 0;
        }, 'getCount');
    }

    static _formatQuery(query, params) {
        if (!params || params.length === 0) return query;
        let index = 0;
        return query.replace(/\?/g, () => {
            const param = params[index++];
            return DBUtil._formatParam(param);
        });
    }

    static _formatParam(param) {
        if (DacUtil.isNullOrUndefined(param)) {
            return 'NULL';
        }
        if (Array.isArray(param)) {
            return DacUtil.formatListToCommaSeparatedString(param);
        }
        if (DacUtil.isNumber(param)) {
            return param;
        }
        return DacUtil.encloseWithSingleQuotes(param);
    }

}

export default DBUtil;
