const router = require('express').Router();
const env = process.env.NODE_ENV || 'development';
require('dotenv').config();
const responseHandle = require('./src/helpers/responseHandle');
const responseCode = require('./src/helpers/responseCode.js');
const { connectDb } = require('./models/index.js');
// Routes
const todoRoutes = require('./routes/todoRoutes.js');

connectDb(process.env.MONGO_URI);

router.use('/todos', todoRoutes);

router.get('/', function (req, res) {
  return responseHandle.responseWithoutData(
    res,
    responseCode.OK,
    'Welcome to Nodeverse!',
  );
});

router.use(function (req, res, next) {
  return responseHandle.responseWithError(
    res,
    responseCode.NOT_FOUND,
    'Route Not Found!',
  );
});

module.exports = router;
