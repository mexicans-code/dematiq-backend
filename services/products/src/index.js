const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorHandler = require('../../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.PRODUCTS_SERVICE_PORT || 3003;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'products' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Products Service] corriendo en puerto ${PORT}`);
});
