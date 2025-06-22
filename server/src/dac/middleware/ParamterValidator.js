import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';

class ParameterValidator {

    static RE_LOGIN = /^\/api^\/login$/;
    static RE_CHECK_SESSION_VALIDITY = /^\/api^\/session$/;

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
                        DacLogger.log(Level.WARN, `Missing fields for /login: ${missingParams.join(', ')}`);
                        return res.status(400).json({ error: `Missing required fields: ${missingParams.join(', ')}` });
                    }
                    req.body = { username, password };
                }
                else if (this.RE_CHECK_SESSION_VALIDITY.test(path)) {
                    DacLogger.log(Level.INFO, "Session Validity Check! Parameter Validation Granted");
                    req.body = {};
                }
                else {
                    DacLogger.log(Level.WARN, `No validation rule defined for path: ${path}`);
                    return res.status(401).json({ error: `No validation rule defined for path: ${path}` });
                }
                next();
            } 
            catch (err) {
                DacLogger.log(Level.ERROR, `Error in ParameterValidator: ${err.stack}`);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
}

export default ParameterValidator;
