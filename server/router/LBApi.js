import express from 'express';
import DacLogger from '../src/dac/util/DacLogger.js';
import Level from '../src/dac/conf/Level.js';
import User from '../src/dac/conf/User.js';
const router = express.Router();
const LOGGER = new DacLogger("LBApi.js");

router.get('/check', (req, res) => {
  LOGGER.log(Level.INFO,"JUST A LB CHECK",User.CLIENT);
  res.send('Check from the Load Balancer API');
});

export default router;
