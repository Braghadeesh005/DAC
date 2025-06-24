import DBUtil from '../db/DBUtil.js';
import StreamObfuscator from '../security/StreamObfuscator.js';
import AuraCrypt from '../security/AuraCrypt.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import DacConfiguration from '../conf/DacConfiguration.js';
import DacQueries from '../conf/DacQueries.js';
import DacUtil from '../util/DacUtil.js';
import ParameterValidator from './ParamterValidator.js';

class SessionMiddleware {

    static updateLastAccessTime() {
        return async (req, res, next) => {
            try {
                if (ParameterValidator.RE_LOGIN.test(req.path) || ParameterValidator.RE_CHECK_SESSION_VALIDITY.test(req.path)) {
                    DacLogger.log(Level.INFO, "Login API / Session Validation API Called. No need of Updating Last Access Time.");
                    return next();
                }
                const authKey = await this._getAuthKey();
                if (!authKey) {
                    DacLogger.log(Level.ERROR, "SESSION_KEY not found in DacConfiguration.");
                    return res.status(401).json({ error: "SESSION_KEY not found in DacConfiguration." });
                }
                const token = req.cookies?.['dac-token'];
                if (!token) {
                    DacLogger.log(Level.ERROR, "Session Credentails missing.");
                    return res.status(401).json({ error: "Session Credentails missing." });
                }
                const digest = this._getDigest(token, authKey);
                const isValid = await this._validateDigest(digest);
                if (!isValid) {
                    DacLogger.log(Level.ERROR, "User Session Not found.");
                    return res.status(401).json({ error: "User Session Not found." });
                }
                await this._updateLastAccessTime(digest);
                next();
            } catch (err) {
                DacLogger.log(Level.ERROR, `Error in SessionMiddleware.updateLastAccessTime(): ${err.stack}`);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
    }

    static async _getAuthKey() {
        const authKey = await DacConfiguration.get(DacConfiguration.PROP_AUTH_KEY);
        DacLogger.log(Level.INFO, "SESSION_KEY found in DacConfiguration.");
        return StreamObfuscator.decrypt(authKey);
    }

    static _getDigest(token, decryptedKey) {
        DacLogger.log(Level.INFO, "USER_TOKEN is getting decrypted");
        return AuraCrypt.decrypt(token, decryptedKey);
    }

    static async _validateDigest(digest) {
        const exists = await DBUtil.hasResults(DacQueries.QUERY_CHECK_DIGEST, [digest]);
        if (!exists) {
            DacLogger.log(Level.INFO, `Session digest not found`);
            return false;
        }
        DacLogger.log(Level.INFO, `Session digest Found`);
        return true;
    }

    static async _updateLastAccessTime(digest) {
        const epochTime = Math.floor(Date.now() / 1000);
        await DBUtil.executeUpdate(DacQueries.QUERY_UPDATE_LAST_ACCESSED, [epochTime, digest]);
        DacLogger.log(Level.INFO, `Updated LAST_ACCESSED_TIME for digest: ${digest}`);
    }
}

export default SessionMiddleware;
