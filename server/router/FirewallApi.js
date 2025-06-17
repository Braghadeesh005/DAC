import express from 'express';
import DacLogger from '../src/dac/util/DacLogger.js';
import Properties from '../src/dac/conf/Properties.js';
const router = express.Router();

router.get('/check', (req, res) => {
  DacLogger.log(Properties.INFO,"JUST A FIREWALL CHECK",Properties.CLIENT);
  res.send('Check from the Firewall API');
});

export default router;