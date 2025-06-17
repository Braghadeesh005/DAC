import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DacLogger from '../util/DacLogger.js';
import Properties from '../conf/Properties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, '../../../../logs/serverlog');
const LOG_FILE = path.join(LOG_DIR, 'dac.log');
const MAX_LINES = 100; // Set to 1000 in production

class DacLogScheduler {
    static rotateLog() {
        try {
            if (!fs.existsSync(LOG_FILE)) {
                DacLogger.log(Properties.WARNING, 'Log file does not exist.', Properties.SCHEDULE);
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
                DacLogger.log(Properties.INFO, `Log rotated. Created archive: ${newFileName}`, Properties.SCHEDULE);
            } else {
                DacLogger.log(Properties.FINE, 'Log file size is within limits. No rotation needed.', Properties.SCHEDULE);
            }
        } catch (error) {
            DacLogger.log(Properties.ERROR, `Error in log rotation: ${error.stack}`, Properties.SCHEDULE);
        }
    }
    static start() {
        DacLogger.log(Properties.INFO, 'Running DacLogScheduler', Properties.SCHEDULE);
        DacLogScheduler.rotateLog();
        setInterval(() => {
            DacLogScheduler.rotateLog();
        }, 3600000); // 1 hour
    }
}

export default DacLogScheduler;