const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (e) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('../../../common/src/middleware/errorHandler');

const app = express();
const PORT = process.env.USERS_SERVICE_PORT || 3002;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'users' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Users Service] corriendo en puerto ${PORT}`);
});
