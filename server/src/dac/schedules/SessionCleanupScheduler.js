import DBUtil from '../db/DBUtil.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
import DacQueries from '../conf/DacQueries.js';
import DacUtil from '../util/DacUtil.js'

class SessionCleanupScheduler {

    static async cleanupExpiredSessions() {
        try {
            const currentEpoch = Math.floor(Date.now() / 1000);
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_ALL_SESSIONS);
            const expiredSessionIdList = rows
                .filter(row => (currentEpoch - row.LAST_ACCESSED_TIME) > 600)
                .map(row => row.SESSION_ID);
            if (DacUtil.isEmptyList(expiredSessionIdList)) {
                DacLogger.log(Level.INFO, 'No expired sessions found.',User.SCHEDULE);
                return;
            }
            await DBUtil.executeUpdate(DacQueries.QUERY_DELETE_EXPIRED_SESSIONS, [expiredSessionIdList]);
            DacLogger.log(Level.INFO, `Deleted ${expiredSessionIdList.length} expired sessions.`,User.SCHEDULE);
        } catch (err) {
            DacLogger.log(Level.ERROR, `Session cleanup failed: ${err.stack}`,User.SCHEDULE);
        }
    }

    static start() {
        this.cleanupExpiredSessions(); 
        setInterval(() => this.cleanupExpiredSessions(), 10 * 60 * 1000);
    }
}

export default SessionCleanupScheduler;
