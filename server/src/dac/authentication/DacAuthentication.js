import DBUtil from '../db/DBUtil.js';
import AuraCrypt from '../security/AuraCrypt.js';
import DigestBuilder from '../security/DigestBuilder.js';
import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import StreamObfuscator from '../security/StreamObfuscator.js';
import DacConfiguration from '../conf/DacConfiguration.js';
import DacQueries from '../conf/DacQueries.js';
const LOGGER = new DacLogger("DacAuthentication.js");

class DacAuthentication {

    static async getUserCredentials(username) {
        try {
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_USER, [username]);
            if (!rows || rows.length === 0) {
                LOGGER.log(Level.WARNING, `User not found: ${username}`);
                return {};
            }
            const { USER_ID: userId, PASSWORD: password } = rows[0];
            return { userId, password };
        } catch (err) {
            throw new Error(`getUserCredentials() failed: ${err.message}`);
        }
    }

    static async isSessionCountReached(userId) {
        try {
            const sessionCount = await DBUtil.getCount(DacQueries.QUERY_COUNT_SESSIONS, [userId]);
            const sessionLimit = await DacConfiguration.get(DacConfiguration.PROP_SESSION_LIMIT); 
            return sessionCount < parseInt(sessionLimit);
        } 
        catch (err) {
            throw new Error(`isSessionCountReached() failed: ${err.message}`);
        }
    }

    static async validateLoginCredentials(inputPassword, encryptedPasswordFromDB) {
        try {
            return await this.decryptUserPassword(encryptedPasswordFromDB) === inputPassword;
        } 
        catch (err) {
            throw new Error(`validateLoginCredentials() failed: ${err.message}`);
        }
    }

    static async decryptUserPassword(encryptedPasswordFromDB) {
        const userPassKey = await DacConfiguration.get(DacConfiguration.PROP_USER_PASSWORD_KEY);
        return AuraCrypt.decrypt(encryptedPasswordFromDB, StreamObfuscator.decrypt(userPassKey));
    }

    static async createSession(userId, ip, os, browser, deviceType, res) {
        try {
            await this.checkAndRemoveStaleSessions(userId, ip, os, browser);
            const digest = DigestBuilder.createDigest();
            const authKey = StreamObfuscator.decrypt(await DacConfiguration.get(DacConfiguration.PROP_AUTH_KEY));
            const encryptedDigestForAuth = AuraCrypt.encrypt(digest, authKey);
            res.cookie('dac-token', encryptedDigestForAuth, {
                httpOnly: true,
                secure: process.env.CROSS_SITE_DEV_TESTING != 'true',
                sameSite: 'None'
            });
            const currentTimeEpoch = Math.floor(Date.now() / 1000);
            await DBUtil.executeUpdate(DacQueries.QUERY_INSERT_SESSION, [userId, digest, currentTimeEpoch, currentTimeEpoch, ip, os, browser, deviceType]);
            LOGGER.log(Level.INFO, `Session created for user ID ${userId}`);
        } 
        catch (err) {
            throw new Error(`createSession() failed: ${err.message}`);
        }
    }

    static async checkAndRemoveStaleSessions(userId, ip, os, browser) {
        try {
            await DBUtil.executeUpdate(DacQueries.QUERY_REMOVE_STALE_SESSIONS, [userId, ip, os, browser]);
            LOGGER.log(Level.INFO, `Deleted stale sessions.`);
        } 
        catch (err) {
            throw new Error(`checkAndRemoveStaleSessions() failed: ${err.message}`);
        }
    }

    static async decryptToken(token) {
        let digest;
        try {
            digest = AuraCrypt.decrypt(token, StreamObfuscator.decrypt(await DacConfiguration.get(DacConfiguration.PROP_AUTH_KEY)));
        } catch (err) {
            LOGGER.log(Level.WARNING, `Failed to decrypt dac-token during terminateSession: ${err.message}`);
            return;
        }
        return digest;
    }

    static async terminateSession(token) {
        try {
            if (!token) {
                LOGGER.log(Level.WARNING, 'Missing dac-token in cookies for terminateSession');
                return;
            }
            let digest=await this.decryptToken(token);
            await DBUtil.executeUpdate(DacQueries.QUERY_DELETE_SESSIONS_BY_DIGEST, [digest]);
            LOGGER.log(Level.INFO, `Terminated sessions for digest.`);
        } 
        catch (err) {
            throw new Error(`terminateSession() failed: ${err.message}`);
        }
    }

    static async checkSessionExists(token) {
        try {
            if (!token) {
                LOGGER.log(Level.WARNING, 'Missing dac-token in cookies');
                return false;
            }
            let digest=await this.decryptToken(token);
            return await DBUtil.hasResults(DacQueries.QUERY_CHECK_DIGEST, [digest]);
        } 
        catch (err) {
            throw new Error(`checkSessionExists() failed: ${err.message}`);
        }
    }
}

export default DacAuthentication;
