import DacLogger from '../util/DacLogger.js';
import DacLogScheduler from '../schedules/DacLogScheduler.js';
import Level from '../conf/Level.js';
import SessionCleanupScheduler from '../schedules/SessionCleanupScheduler.js';
import ReEncryptKeysScheduler from '../schedules/ReEncryptKeysScheduler.js';
const LOGGER = new DacLogger("DacStartup.js");

class DacStartup {
    static initialize() {
        DacLogger.initializeLogger();
        DacLogScheduler.start();
        SessionCleanupScheduler.start();
        ReEncryptKeysScheduler.start();
        LOGGER.log(Level.INFO, 'DAC Startup Completed');
    }
}

export default DacStartup;
