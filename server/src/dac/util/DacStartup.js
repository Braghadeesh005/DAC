import DacLogger from './DacLogger.js';
import DacLogScheduler from '../schedules/DacLogScheduler.js';
import Properties from '../conf/Properties.js';

class DacStartup {
    static initialize() {
        DacLogger.initializeLogger(); // Initialize Dac Logs
        DacLogScheduler.start(); // Run and Initialize DacLogScheduler
        DacLogger.log(Properties.INFO, 'DacStartup completed');
    }
}

export default DacStartup;