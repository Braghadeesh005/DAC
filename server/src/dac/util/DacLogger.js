import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
import DacUtil from './DacUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, '../../../../logs/serverlog');
const LOG_FILE = path.join(LOG_DIR, 'dac.log');

class DacLogger {
    constructor(className) {
        this.className = className;
    }

    static initializeLogger() {
        try {
            if (!fs.existsSync(LOG_DIR)) {
                fs.mkdirSync(LOG_DIR, { recursive: true });
            }
            if (!fs.existsSync(LOG_FILE)) {
                fs.writeFileSync(LOG_FILE, '');
            }
        } catch (err) {
            console.error('[LOGGER_INIT_ERROR]', err.stack || err);
        }
    }

    log(status, message, user = User.DAC, err = null) {
        const allowedStatuses = ['FINE', 'INFO', 'DEBUG', 'WARNING', 'ERROR'];
        if (!allowedStatuses.includes(status)) {
            const errorMsg = `[LOGGER_VALIDATION_ERROR] Invalid log status: ${status}. Allowed: ${allowedStatuses.join(', ')}`;
            console.error(errorMsg);
            this.log('ERROR', errorMsg, user);
            return;
        }
        try {
            const timestamp = DacUtil.getISTTimestamp();
            const stackInfo = err ? err.stack : '';
            const classTag = `[${this.className}]`;
            const logEntry =`[${timestamp}] [${user}] [${status}] ${classTag}: ${message}\n${stackInfo}\n`;
            fs.appendFileSync(LOG_FILE, logEntry);
        } catch (err) {
            console.error('[LOGGER_WRITE_ERROR]', err.stack || err);
        }
    }
}

export default DacLogger;
