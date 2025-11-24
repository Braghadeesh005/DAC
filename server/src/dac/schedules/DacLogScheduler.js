import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DacLogger from '../util/DacLogger.js';
import User from '../conf/User.js'
import Level from '../conf/Level.js';
const LOGGER = new DacLogger("DacLogScheduler.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, '../../../../logs/serverlog');
const LOG_FILE = path.join(LOG_DIR, 'dac.log');
const MAX_LINES = 1000; // Set to 5000 in production

class DacLogScheduler {
    static rotateLog() {
        try {
            if (!fs.existsSync(LOG_FILE)) {
                LOGGER.log(Level.WARNING, 'Log file does not exist.', User.SCHEDULE);
                return;
            }
            const lines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n');
            if (lines.length > MAX_LINES) {
                const now = new Date();
                const timestamp = now.toLocaleString('en-GB', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                    hour12: false
                }).replace(/[/:]/g, '-').replace(', ', '_');
                const newFileName = `dac_${timestamp}.log`;
                const archivePath = path.join(LOG_DIR, newFileName);
                fs.writeFileSync(archivePath, lines.join('\n'));
                fs.writeFileSync(LOG_FILE, '');
                LOGGER.log(Level.INFO, `Log rotated. Created archive: ${newFileName}`, User.SCHEDULE);
            } else {
                LOGGER.log(Level.FINE, 'Log file size is within limits. No rotation needed.', User.SCHEDULE);
            }
        } catch (err) {
            LOGGER.log(Level.ERROR, `Error in log rotation: ${err.message}`, User.SCHEDULE, err);
        }
    }
    static start() {
        LOGGER.log(Level.INFO, 'Running DacLogScheduler', User.SCHEDULE);
        DacLogScheduler.rotateLog();
        setInterval(() => {
            DacLogScheduler.rotateLog();
        }, 3600000); // 1 hour
    }
}

export default DacLogScheduler;
