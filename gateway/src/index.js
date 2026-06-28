const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || process.env.GATEWAY_PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gateway' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Gateway] corriendo en puerto ${PORT}`);
});
