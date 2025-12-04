import DBUtil from "../db/DBUtil.js";
import DacLogger from "../util/DacLogger.js";
import DacQueries from "./DacQueries.js";
import Level from "./Level.js";
const LOGGER = new DacLogger("DacUser.js");

class DacUser {

  #userId;
  #userName;
  #password;
  static #cacheMap = new Map();

  constructor(userId, userName, password) {
    this.#userId = userId;
    this.#userName = userName;
    this.#password = password;
  }

  static getCachedUser(userId) {
    return this.#cacheMap.get(userId);
  }

  static createAndSetUserInCache(userId, userName, password) {
    let instance = new DacUser(userId, userName, password);
    this.#cacheMap.set(userId, instance);
    LOGGER.log(Level.FINE, `User details updated in cache`);
    return instance;
  }

  static async getUserInstance(userId) {
    if (this.#cacheMap.has(userId)) {
      LOGGER.log(Level.FINE,`User Details already available in the Cache Map. Returnung this...`);
      return this.#cacheMap.get(userId);
    }
    LOGGER.log(Level.INFO,`User Details not available in the Cache Map.`);
    const instance = new DacUser();
    await instance.#load(userId);
    this.#cacheMap.set(userId, instance);
    LOGGER.log(Level.FINE,`User Details loaded from DB and stored in Cache Map.`);
    return instance;
  }

  async #load(userId) {
    const result = await DBUtil.getResults(`${DacQueries.QUERY_GET_USER} WHERE USER_ID = ${userId}`);
    if (!result?.[0]) {
        LOGGER.log(Level.ERROR,`User Not Found in the DB`);
        throw new Error(`User not found: ${userId}`);
    }
    this.#userId = result[0].USER_ID;
    this.#userName = result[0].USER_NAME;
    this.#password = result[0].PASSWORD;
  }

  getUserId() {
    return this.#userId;
  }

  getUserName() {
    return this.#userName;
  }
  
  getPassword() {
    return this.#password;
  }
  
  static clearCache() {
    this.#cacheMap.clear();
  }
}

export default DacUser;
