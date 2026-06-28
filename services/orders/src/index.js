const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('../../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.ORDERS_SERVICE_PORT || 3004;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'orders' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Orders Service] corriendo en puerto ${PORT}`);
});
