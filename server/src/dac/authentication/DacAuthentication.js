import DBUtil from '../db/DBUtil.js';
import AuraCrypt from '../security/AuraCrypt.js';
import DigestBuilder from '../security/DigestBuilder.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import StreamObfuscator from '../security/StreamObfuscator.js';
import DacConfiguration from '../conf/DacConfiguration.js';
import DacQueries from '../conf/DacQueries.js';

class DacAuthentication {

    static async getUserCredentials(username) {
        try {
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_USER, [username]);
            if (!rows || rows.length === 0) {
                DacLogger.log(Level.WARNING, `User not found: ${username}`);
                throw new Error('User not found');
            }
            const { USER_ID: userId, PASSWORD: password } = rows[0];
            return { userId, password };
        } catch (err) {
            throw new Error(`getUserCredentials() failed: ${err.message}`);
        }
    }

    static async isSessionCountReached(userId) {
        try {
            const sessionCountRow = await DBUtil.getResults(DacQueries.QUERY_GET_PROPS_DAC_CONFIGURATION, [DacConfiguration.PROP_SESSION_LIMIT]);
            if (!sessionCountRow) {
                DacLogger.log(Level.ERROR,`Missing configuration: ${DacConfiguration.PROP_SESSION_LIMIT}`);
                throw new Error(`Missing configuration: ${DacConfiguration.PROP_SESSION_LIMIT}`);
            }
            const sessionLimit = parseInt(sessionCountRow[0].PROPVAL);
            const sessionCount = await DBUtil.getCount(DacQueries.QUERY_COUNT_SESSIONS, [userId]);
            return sessionCount < sessionLimit;
        } 
        catch (err) {
            throw new Error(`isSessionCountReached() failed: ${err.message}`);
        }
    }

    static async validateLoginCredentials(inputPassword, encryptedPasswordFromDB) {
        try {
            const keyRow = await DBUtil.getResults(DacQueries.QUERY_GET_PROPS_DAC_CONFIGURATION, [this.PROP_AUTH_KEY]);
            if (!keyRow) {
                DacLogger.log(Level.ERROR,`Missing configuration: ${this.PROP_AUTH_KEY}`);
                throw new Error(`Missing configuration: ${this.PROP_AUTH_KEY}`);
            }
            return AuraCrypt.decrypt(encryptedPasswordFromDB, keyRow[0].PROPVAL) === inputPassword;
        } 
        catch (err) {
            throw new Error(`validateLoginCredentials() failed: ${err.message}`);
        }
    }

    static async createSession(userId, ip, os, browser, deviceType, res) {
        try {
            const digest = DigestBuilder.createDigest();
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_PROPS_DAC_CONFIGURATION, [[this.PROP_SESSION_KEY, this.PROP_AUTH_KEY]]);
            const keyMap = {};
            for (const { PROPNAME, PROPVAL } of rows) {
                keyMap[PROPNAME] = PROPVAL;
            }
            const sessionKey = StreamObfuscator.decrypt(keyMap[this.PROP_SESSION_KEY]);
            const authKey = StreamObfuscator.decrypt(keyMap[this.PROP_AUTH_KEY]);
            if (!sessionKey || !authKey) {
                DacLogger.log(Level.ERROR,'Missing Session/Authentication keys in DacConfiguration');
                throw new Error('Missing Session/Authentication keys in DacConfiguration');
            }
            const encryptedDigestForAuth = AuraCrypt.encrypt(digest, authKey);
            res.cookie('dac-token', encryptedDigestForAuth, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            });
            const currentTimeEpoch = Math.floor(Date.now() / 1000);
            const encryptedDigestForSession = AuraCrypt.encrypt(digest, sessionKey);
            await DBUtil.executeUpdate(DacQueries.QUERY_INSERT_SESSION, [userId, encryptedDigestForSession, currentTimeEpoch, currentTimeEpoch, ip, os, browser, deviceType]);
            DacLogger.log(Level.INFO, `Session created for user ID ${userId}`);
        } 
        catch (err) {
            throw new Error(`createSession() failed: ${err.message}`);
        }
    }

    static async checkSessionExists(req) {
        try {
            const token = req.cookies?.['dac-token'];
            if (!token) {
                DacLogger.log(Level.WARN, 'Missing dac-token in cookies');
                return false;
            }
            const keyRow = await DBUtil.getResults(DacQueries.QUERY_GET_PROPS_DAC_CONFIGURATION, [DacConfiguration.PROP_AUTH_KEY]);
            if (DacUtil.isEmptyList(keyRow)) {
                DacLogger.log(Level.ERROR, `Missing configuration: ${this.PROP_AUTH_KEY}`);
                throw new Error(`Missing configuration: ${this.PROP_AUTH_KEY}`);
            }
            const digest = AuraCrypt.decrypt(token, keyRow[0].PROPVAL);
            return await DBUtil.hasResults(DacQueries.QUERY_CHECK_DIGEST, [digest]);
        } 
        catch (err) {
            throw new Error(`checkSessionExists() failed: ${err.message}`);
        }
    }
}

export default DacAuthentication;
