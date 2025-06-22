import DBConnector from './DBConnector.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js'

class DBUtil {

    static async _runQuery(sqlQuery, resultHandler, operation) {
        let connection;
        try {
            DacLogger.log(Level.INFO, `Executing ${operation} for query: ${sqlQuery}`);
            connection = DBConnector.connect();
            return await new Promise((resolve, reject) => {
                connection.query(sqlQuery, (err, result) => {
                    if (err) {
                        DacLogger.log(Level.ERROR, `Error in ${operation}: ${err.stack}`);
                        reject(err);
                    } else {
                        const result = resultHandler(result);
                        DacLogger.log(Level.FINE, `${operation} executed successfully.`);
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            DacLogger.log(Level.ERROR, `Exception in ${operation}: ${error.stack}`);
            throw error;
        } finally {
            if (connection) connection.end();
        }
    }

    static async getResults(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            DacLogger.log(Level.INFO, `getResults returned ${result.length} rows.`);
            return result;
        }, 'getResults');
    }

    static async hasResults(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            const has = result.length > 0;
            DacLogger.log(Level.INFO, `hasResults returned ${has}`);
            return has;
        }, 'hasResults');
    }

    static async executeUpdate(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            DacLogger.log(Level.INFO, `executeUpdate affected ${result.affectedRows} rows.`);
            return result.affectedRows;
        }, 'executeUpdate');
    }

    static async getCount(sqlQuery, params = []) {
        return await DBUtil._runQuery(DBUtil._formatQuery(sqlQuery, params), result => {
            DacLogger.log(Level.INFO, `getCount returned ${result[0] ? Object.values(result[0])[0] : 0} rows.`);
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
