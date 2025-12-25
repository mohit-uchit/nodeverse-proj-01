const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const os = require('os');
const pino = require('./src/services/logging/pinoService.js');

/** Route Config */
const webServer = require('./api');
dotenv.config();

const app = express();
const server = http.createServer(app);
const { port = 3000 } = process.env;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

app.use(pino);

// Middlewares
// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use(helmet());

const allowedOrigins = process.env.CORS_SERVER_ADDRESS.split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(allowedOrigin =>
        origin.includes(allowedOrigin),
      );
      if (!isAllowed) {
        var msg =
          'The CORS policy for this site does not allow access from ' + origin;
        console.log(msg);
        return callback(null, false);
      }
      return callback(null, true);
    },
  }),
);

app.use(express.json());

app.use('/api', webServer);

// Error Handler
app.use((err, req, res, next) =>
  res.status(500).json({
    message: 'Internal server error',
    error: isProduction ? null : err,
  }),
);

// Start the server
server.listen(port, () => {
  pino.logger.info(`Server running on port ${port}.`);
});

pino.logger.info('CPU cores available:', os.cpus().length);

