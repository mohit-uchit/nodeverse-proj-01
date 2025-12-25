const _ = require('lodash');
const env = process.env.NODE_ENV || 'development';
const slackService = require('../services/notifications/slackService.js');
const pino = require('../services/logging/pinoService.js');
const { sendEmailHelper } = require('../services/notifications/emailHelper.js');

const sendToSlack = async errorMsg => {
  await slackService.sendToSlack(errorMsg);
};

/**
 * Log error message to Pino and optionally Slack.
 * @param {object} err Object for error, for example thrown by external API.
 * @param {string} slackMsg Optional message to Slack.
 */
const logErrMsg = (err, slackMsg) => {
  let msg = 'ERROR: caught in logErrMsg: ';
  if (typeof err === 'object') {
    // Traditional error or anything to log.
    msg += JSON.stringify(err.response?.data ? err.response.data : err) + ' ';
  }
  pino.logger.error(err, msg);
  if (slackMsg) {
    sendToSlack(slackMsg);
  }
  if (env === 'production' && process.env.ERROR_ALERT_ADDRESS) {
    sendEmailHelper({
      to: [process.env.ERROR_ALERT_ADDRESS],
      subject: slackMsg,
      content:
        msg + '<br>' + JSON.stringify(err, Object.getOwnPropertyNames(err)),
    }).catch(err => pino.logger.error(err));
  }
};

/**
 * Log to pino info.
 * @param  {...any} args First is an optional object, 2nd is an optional string.
 * See https://github.com/pinojs/pino/blob/master/docs/api.md#loggerinfomergingobject-message-interpolationvalues.
 */
const logInfo = (...args) => {
  pino.logger.info(...args);
};

/**
 * Log current memory usage.
 */
const logMemory = () => {
  pino.logger.info('MEMORY: ' + JSON.stringify(_getMemoryUsage()));
};

const memoryString = () => {
  return JSON.stringify(_getMemoryUsage());
};

const _getMemoryUsage = () => {
  const memoryData = process.memoryUsage();

  return {
    rss: `${_bytesToMiB(memoryData.rss)}`, //  -> Resident Set Size - total memory allocated for the process execution
    heapTotal: `${_bytesToMiB(memoryData.heapTotal)}`, //  -> total size of the allocated heap
    heapUsed: `${_bytesToMiB(memoryData.heapUsed)}`, //  -> actual memory used during the execution
    external: `${_bytesToMiB(memoryData.external)}`, // -> V8 external memory
  };
};

/**
 * Convert bytes to MiB.
 * @param {number} bytes
 * @returns
 */
const _bytesToMiB = bytes => `${_.round(bytes / 1024 / 1024)} MiB`;

module.exports = { sendToSlack, logErrMsg, logInfo, logMemory, memoryString };
