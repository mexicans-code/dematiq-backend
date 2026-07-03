const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('../../common/src/utils/logger');
const { noCache } = require('../../common/src/middleware/cacheControl');
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

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});
app.use('/api', limiter);

app.use(morgan('dev'));
app.use('/api', noCache);
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gateway' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Gateway corriendo en puerto ${PORT}`);
});
