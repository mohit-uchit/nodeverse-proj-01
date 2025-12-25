const pino = require('pino');
const logger = require('pino-http')({
  logger: pino({
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  autoLogging: false,
});

module.exports = logger;
