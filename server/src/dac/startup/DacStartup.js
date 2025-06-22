import DacLogger from '../util/DacLogger.js';
import DacLogScheduler from '../schedules/DacLogScheduler.js';
import Level from '../conf/Level.js';
import SessionCleanupScheduler from '../schedules/SessionCleanupScheduler.js';

class DacStartup {
    static initialize() {
        DacLogger.initializeLogger();
        DacLogScheduler.start();
        SessionCleanupScheduler.start();
        DacLogger.log(Level.INFO, 'DacStartup completed');
    }
}

export default DacStartup;
