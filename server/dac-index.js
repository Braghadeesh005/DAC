import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: "./config-properties.env" });

// Utils
import DacStartup from './src/dac/startup/DacStartup.js';
import DacLogger from './src/dac/util/DacLogger.js';
import Level from './src/dac/conf/Level.js';
const LOGGER = new DacLogger("dac-index.js");

// Import APIs 
import AuthenticationApi from './router/AuthenticationApi.js'
import InventoryApi from './router/InventoryApi.js'
import FirewallApi from './router/FirewallApi.js'
import LBApi from './router/LBApi.js'

// Middlewares
import SessionMiddleware from './src/dac/middleware/SessionMiddleware.js';
import ParameterValidator from './src/dac/middleware/ParameterValidator.js';

const app = express();
const PORT = process.env.SERVER_PORT;

/*  
    CORS Configuration in Config File :
      1. For Remote Requests Handling in Dev Environment : Set CROSS_SITE_DEV_TESTING = true and Update Browser Configuration to Allow Insecure Remote Requests.
      2. For Production Environment (When HTTPS Enabled) : Set PRODUCTION = true.
*/

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, false);
      cb(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Initialize Startup Class
DacStartup.initialize();

//Parser
app.use(express.json());
app.use(cookieParser());

//Middlewares
app.use(ParameterValidator.validate());
app.use(SessionMiddleware.updateLastAccessTime());

// APIs
app.use('/api/auth', AuthenticationApi);
app.use('/api/inv', InventoryApi);
app.use('/api/fw', FirewallApi);
app.use('/api/lb', LBApi);

// Rendering client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.resolve(__dirname, './client/dac/build');
app.use(express.static(clientBuildPath));
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Express server
app.listen(PORT, () => {
    LOGGER.log(Level.FINE,`Server is listening on port ${PORT}`);
});
