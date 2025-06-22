import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Level from '../conf/Level.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, '../../../../logs/serverlog');
const LOG_FILE = path.join(LOG_DIR, 'dac.log');

class DacLogger {
    static initializeLogger() {
        try {
            if (!fs.existsSync(LOG_DIR)) {
                fs.mkdirSync(LOG_DIR, { recursive: true });
            }
            if (!fs.existsSync(LOG_FILE)) {
                fs.writeFileSync(LOG_FILE, '');
            }
        DacLogger.log(Level.FINE,'Dac Log Enabled Successfully')    
        } catch (err) {
            console.error('[LOGGER_INIT_ERROR]', err.stack || err);
        }
    }
    static log(status, message, user = User.DAC) {
        const allowedStatuses = ['FINE','INFO', 'DEBUG', 'WARNING', 'ERROR'];
        if (!allowedStatuses.includes(status)) {
            const errorMsg = `[LOGGER_VALIDATION_ERROR] Invalid log status: ${status}. Allowed: ${allowedStatuses.join(', ')}`;
            console.error(errorMsg);
            DacLogger.log(Level.ERROR,errorMsg,user);
            return;
        }
        try {
            const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
            const logEntry = `[${timestamp}] [${user}] [${status}] ${message}\n`;
            fs.appendFileSync(LOG_FILE, logEntry);
        } catch (err) {
            console.error('[LOGGER_WRITE_ERROR]', err.stack || err);
        }
    }
}

export default DacLogger;
