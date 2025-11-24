import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
const LOGGER = new DacLogger("ParamaterValidator.js");

class ParameterValidator {

    static RE_LOGIN = /^\/api\/auth\/login$/;
    static RE_CHECK_SESSION_VALIDITY = /^\/api\/auth\/session$/;

    static validate() {
        return (req, res, next) => {
            const path = req.path;
            const missingParams = [];
            try {
                if (this.RE_LOGIN.test(path)) {
                    const { username, password } = req.body;
                    if (!username) missingParams.push('username');
                    if (!password) missingParams.push('password');
                    if (missingParams.length > 0) {
                        LOGGER.log(Level.WARNING, `Missing fields for /login: ${missingParams.join(', ')}`);
                        return res.status(400).json({ error: `Missing required fields: ${missingParams.join(', ')}` });
                    }
                    req.body = { username, password };
                }
                else if (this.RE_CHECK_SESSION_VALIDITY.test(path)) {
                    LOGGER.log(Level.INFO, "Session Validity Check! Parameter Validation Granted");
                    req.body = {};
                }
                else {
                    LOGGER.log(Level.WARNING, `No validation rule defined for path: ${path}`);
                    return res.status(401).json({ error: `No validation rule defined for path: ${path}` });
                }
                LOGGER.log(Level.FINE,"Paramter Validation Completed");
                next();
            } 
            catch (err) {
                LOGGER.log(Level.ERROR, `Error in ParameterValidator: ${err.message}`, User.DAC, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
}

export default ParameterValidator;
