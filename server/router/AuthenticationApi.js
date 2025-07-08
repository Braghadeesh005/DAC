import express from 'express';
import DacLogger from '../src/dac/util/DacLogger.js';
import Level from '../src/dac/conf/Level.js';
import User from '../src/dac/conf/User.js';
import DacAuthentication from '../src/dac/authentication/DacAuthentication.js';
import ClientInfoExtractor from '../src/dac/util/ClientInfoExtracter.js';
const router = express.Router();

router.get('/check', (req, res) => {
  DacLogger.log(Level.INFO,"JUST A AUTH CHECK",User.CLIENT);
  res.send('Check from the Authentication API');
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  try{
    const userData = await DacAuthentication.getUserCredentials(username);
    const allowed = await DacAuthentication.isSessionCountReached(userData.userId);
    if (!allowed) {
      DacLogger.log(Level.WARNING, 'User Session Count Reached');
      return res.status(400).json({ error: `User Session Count Reached!` });
    }
    const isValid = await DacAuthentication.validateLoginCredentials(password, userData.password);
    if (!isValid) {
      DacLogger.log(Level.WARNING, 'User Password Wrong');
      return res.status(400).json({ error: `Password Wrong!` });
    }
    const { ip, os, browser, deviceType} = ClientInfoExtractor.extract(req);
    DacLogger.log(Level.FINE, 'User Login Successful and created new Session');
    await DacAuthentication.createSession(userData.userId, ip, os, browser, deviceType, res);
    return res.status(200).json({ message: `Login Successful`,  userId: userData.userId});
  }
  catch(err){
    DacLogger.log(Level.ERROR, `Login failed due to error: ${err.stack()}`,User.CLIENT);
    return res.status(500).json({ error: `Login failed due to Internal Server Error`});
  }
});

router.post('/session', async (req, res) => {
  try{
    const isValid = await DacAuthentication.checkSessionExists(req);
    DacLogger.log(Level.INFO, isValid ? `Session Exists` : `Session Doesn't Exists`, User.CLIENT);
    return res.status(200).json({isValid});
  }
  catch (err){
    DacLogger.log(Level.ERROR, `Session Validation Failed due to error: ${err.stack()}`,User.CLIENT);
    return res.status(500).json({ error: `Session Validation failed due to Internal Server Error`});
  }
});

export default router;
