import DBUtil from '../db/DBUtil.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
import DacQueries from '../conf/DacQueries.js';
import DacUtil from '../util/DacUtil.js'
const LOGGER = new DacLogger("SessionCleanupScheduler.js");

class SessionCleanupScheduler {
    static time = 10 * 60;
    static time_in_milliseconds = this.time * 1000;
    static async cleanupExpiredSessions() {
        try {
            await DBUtil.executeUpdate(DacQueries.QUERY_DELETE_EXPIRED_SESSIONS, [this.time] );
            LOGGER.log(Level.INFO, `Deleted ${expiredSessionIdList.length} expired sessions.`,User.SCHEDULE);
        } catch (err) {
            LOGGER.log(Level.ERROR, `Session cleanup failed: ${err.message}`,User.SCHEDULE, err);
        }
    }

    static start() {
        this.cleanupExpiredSessions(); 
        setInterval(() => this.cleanupExpiredSessions(), this.time_in_milliseconds);
    }
}

export default SessionCleanupScheduler;
