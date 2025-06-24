import DacQueries from "./DacQueries.js";
import DBUtil from "../db/DBUtil.js";
import DacUtil from "../util/DacUtil.js";
import DacLogger from "../util/DacLogger.js";
import Level from "./Level.js";

class DacConfiguration {
    static PROP_SESSION_LIMIT = 'user-session-count-limit';
    static PROP_AUTH_KEY = 'authentication-key';
    static PROP_USER_PASSWORD_KEY = 'user-password-key';

    static async get(key){
        try{
            const rows = await DBUtil.getResults(DacQueries.QUERY_GET_PROPS_DAC_CONFIGURATION,[key]);
            const propVal = rows[0].PROPVAL;
            if(DacUtil.isNullOrUndefined(propVal)){
                DacLogger.log(Level.FINE, `${key} not found in DacConfiguration.`);
                throw new Error(`${key} not found in DacConfiguration.`); 
            }
            DacLogger.log(Level.FINE, `${key} found in DacConfiguration.`);
            return propVal;
        }
        catch(err){
            throw new Error(`Error Occured in DacConfiguration.get() : ${err.message}`); 
        }
    }
}

export default DacConfiguration;
