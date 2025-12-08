import DBUtil from '../db/DBUtil.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
import DacQueries from '../conf/DacQueries.js';
import StreamObfuscator from '../security/StreamObfuscator.js';
const LOGGER = new DacLogger("ReEncryptKeysScheduler.js");

class ReEncryptKeysScheduler {
    static async reEncryptAllKeys() {
        try {
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_ALL_KEYS_DAC_CONFIGURATION);
            if (!rows || rows.length === 0) {
                LOGGER.log(Level.INFO, "No key entries found in DacConfiguration.", User.SCHEDULE);
                return;
            }
            for (const row of rows) {
                const { PROPNAME, PROPVAL } = row;
                try {
                    const decrypted = StreamObfuscator.decrypt(PROPVAL);
                    const reEncrypted = StreamObfuscator.encrypt(decrypted);
                    await DBUtil.executeUpdate(DacQueries.QUERY_UPDATE_DAC_CONFIG_VALUE,[reEncrypted, PROPNAME]);
                    LOGGER.log(Level.INFO,`Successfully re-encrypted key ${PROPNAME}.`,User.SCHEDULE);
                }
                catch (innerErr) {
                    LOGGER.log(Level.ERROR,`Failed to re-encrypt key ${PROPNAME}: ${innerErr.message}`,User.SCHEDULE,innerErr);
                }
            }
        } catch (err) {
            LOGGER.log(Level.ERROR, `Key re-encryption failed: ${err.message}`, User.SCHEDULE, err);
        }
    }
    static start() {
        this.reEncryptAllKeys(); 
        setInterval(() => this.reEncryptAllKeys(), 24 * 60 * 60 * 1000);
    }
}

export default ReEncryptKeysScheduler;
