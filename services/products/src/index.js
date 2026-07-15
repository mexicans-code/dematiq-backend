const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('../../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.PRODUCTS_SERVICE_PORT || 3003;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/brands', brandRoutes);
app.use('/quotations', quotationRoutes);
app.use('/upload', uploadRoutes);
app.use('/settings', settingsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'products' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Products Service] corriendo en puerto ${PORT}`);
});
