const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('../../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Auth Service] corriendo en puerto ${PORT}`);
});
