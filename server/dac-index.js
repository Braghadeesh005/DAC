import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Utils
import DacStartup from './src/dac/util/DacStartup.js';
import DacLogger from './src/dac/util/DacLogger.js';

// Import APIs 
import AuthenticationApi from './router/AuthenticationApi.js'
import InventoryApi from './router/InventoryApi.js'
import FirewallApi from './router/FirewallApi.js'
import LBApi from './router/LBApi.js'

const app = express();
const PORT = 4000;

// Initialize Startup Class
DacStartup.initialize();

// APIs
app.use('/auth', AuthenticationApi);
app.use('/inv', InventoryApi);
app.use('/fw', FirewallApi);
app.use('/lb', LBApi);

// Rendering client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.resolve(__dirname, './client/dac/build');
app.use(express.static(clientBuildPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Express server
app.listen(PORT, () => {
    DacLogger.log('FINE',`Server is listening on port ${PORT}`);
});