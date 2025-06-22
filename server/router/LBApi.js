import express from 'express';
import DacLogger from '../src/dac/util/DacLogger.js';
import Level from '../src/dac/conf/Level.js';
const router = express.Router();

router.get('/check', (req, res) => {
  DacLogger.log(Level.INFO,"JUST A LB CHECK",User.CLIENT);
  res.send('Check from the Load Balancer API');
});

export default router;
