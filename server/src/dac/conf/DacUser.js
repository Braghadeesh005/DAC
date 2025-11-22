import DBUtil from "../db/DBUtil.js";
import DacLogger from "../util/DacLogger.js";
import DacQueries from "./DacQueries.js";
import Level from "./Level.js";

class DacUser {

  #userId;
  #userName;
  static #cacheMap = new Map();

  static async getUserInstance(userId) {
    if (this.#cacheMap.has(userId)) {
      DacLogger.log(Level.FINE,`User Details already available in the Cache Map. Returnung this...`);
      return this.#cacheMap.get(userId);
    }
    DacLogger.log(Level.INFO,`User Details not available in the Cache Map.`);
    const instance = new DacUser();
    await instance.#load(userId);
    this.#cacheMap.set(userId, instance);
    DacLogger.log(Level.FINE,`User Details loaded from DB and stored in Cache Map.`);
    return instance;
  }

  async #load(userId) {
    const result = await DBUtil.getResults(DacQueries.QUERY_FETCH_USER_DETAILS_WITH_ID, [userId]);
    if (!result?.[0]) {
        DacLogger.log(Level.ERROR,`User Not Found in the DB`);
        throw new Error(`User not found: ${userId}`);
    }
    this.#userId = result[0].USER_ID;
    this.#userName = result[0].USER_NAME;
  }

  getUserId() {
    return this.#userId;
  }

  getUserName() {
    return this.#userName;
  }
  
  static clearCache() {
    this.#cacheMap.clear();
  }
}

export default DacUser;
