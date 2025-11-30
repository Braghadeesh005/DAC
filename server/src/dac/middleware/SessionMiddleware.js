import DBUtil from '../db/DBUtil.js';
import StreamObfuscator from '../security/StreamObfuscator.js';
import AuraCrypt from '../security/AuraCrypt.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import DacConfiguration from '../conf/DacConfiguration.js';
import DacQueries from '../conf/DacQueries.js';
import User from '../conf/User.js';
import paramSchema from './params-security.json' with { type: "json" };
const LOGGER = new DacLogger("SessionMiddleware.js");

class SessionMiddleware {

    static skipUpdate(path) {
        if (!path.startsWith("/api")) {
            LOGGER.log(Level.INFO, "Frontend route — skipping last access update.");
            return true;
        }
        const rules = paramSchema[path];
        if (rules && rules.skipLastAccess) {
            LOGGER.log(Level.INFO, `Special API ${path} — skipping last access update.`);
            return true;
        }
        return false;
    }

    static updateLastAccessTime() {
        return async (req, res, next) => {
            try {
                LOGGER.log(Level.INFO, `Update Last Access Time Middleware called for API Path : ${req.path}`);
                if(this.skipUpdate(req.path)){
                    return next();
                }
                const authKey = await this._getAuthKey();
                if (!authKey) {
                    LOGGER.log(Level.ERROR, "SESSION_KEY not found in DacConfiguration.");
                    return res.status(401).json({ error: "SESSION_KEY not found in DacConfiguration." });
                }
                const token = req.cookies?.['dac-token'];
                if (!token) {
                    LOGGER.log(Level.ERROR, "Session Credentails missing.");
                    return res.status(401).json({ error: "Session Credentails missing." });
                }
                const digest = this._getDigest(token, authKey);
                const isValid = await this._validateDigest(digest);
                if (!isValid) {
                    LOGGER.log(Level.ERROR, "User Session Not found.");
                    return res.status(401).json({ error: "User Session Not found." });
                }
                await this._updateLastAccessTime(digest);
                next();
            } catch (err) {
                LOGGER.log(Level.ERROR, `Error in SessionMiddleware.updateLastAccessTime() : ${err.message}`, User.DAC, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
    }

    static async _getAuthKey() {
        const authKey = await DacConfiguration.get(DacConfiguration.PROP_AUTH_KEY);
        LOGGER.log(Level.INFO, "SESSION_KEY found in DacConfiguration.");
        return StreamObfuscator.decrypt(authKey);
    }

    static _getDigest(token, decryptedKey) {
        LOGGER.log(Level.INFO, "USER_TOKEN is getting decrypted");
        return AuraCrypt.decrypt(token, decryptedKey);
    }

    static async _validateDigest(digest) {
        const exists = await DBUtil.hasResults(DacQueries.QUERY_CHECK_DIGEST, [digest]);
        if (!exists) {
            LOGGER.log(Level.INFO, `Session digest not found`);
            return false;
        }
        LOGGER.log(Level.INFO, `Session digest Found`);
        return true;
    }

    static async _updateLastAccessTime(digest) {
        const epochTime = Math.floor(Date.now() / 1000);
        await DBUtil.executeUpdate(DacQueries.QUERY_UPDATE_LAST_ACCESSED, [epochTime, digest]);
        LOGGER.log(Level.INFO, `Updated LAST_ACCESSED_TIME for digest: ${digest}`);
    }
}

export default SessionMiddleware;
