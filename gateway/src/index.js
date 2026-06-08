const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gateway' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Gateway] corriendo en puerto ${PORT}`);
});
