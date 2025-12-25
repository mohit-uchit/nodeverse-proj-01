const _ = require('lodash');
const responseCode = require('./responseCode');
const responseMessage = require('./responseMessage');

module.exports = {
  responseWithData: (res, responseCode, message = '', data, token = null) => {
    return res.status(responseCode).send({
      result: true,
      message: message,
      payload: data,
      token: token ? token : undefined,
    });
  },
  responseWithFile: (res, responseCode, path) => {
    return res.status(responseCode).sendFile(path);
  },
  responseWithoutData: (res, responseCode, message = '') => {
    return res.status(responseCode).send({ result: true, message: message });
  },
  responseWithError: (res, responseCode, message) => {
    return res
      .status(responseCode)
      .send({ result: false, message: message, payload: null });
  },
  responseWithValidationErrors: (res, responseCode, validationErrors = []) => {
    let message = 'The given data was invalid.';
    let path = null;

    if (!_.isNil(validationErrors) && !_.isEmpty(validationErrors)) {
      message = validationErrors[0].msg;
      if (validationErrors[0].path) {
        path = validationErrors[0].path;
      }
    }
    let responseBody = {
      result: false,
      message: message,
      path: path,
      payload: null,
    };
    return res.status(responseCode).send(responseBody);
  },

  handleError: (res, err) => {
    let statusCode = err.status || responseCode.INTERNAL_SERVER_ERROR;
    const errorMessage = err.message || responseMessage.INTERNAL_SERVER_ERROR;
    if (!err.skipLogging) {
      // Pino logger
      let msg = 'ERROR: userId ' + res.req?.userId + ' caught in handleError: ';
      if (err.response?.data) {
        msg += JSON.stringify(err.response.data) + ' ';
      }
      res.log.error(err, msg);
    }
    if (statusCode == 401) {
      statusCode = 500; // Temp solution to handle external integration returns 401 error.
    }
    return res
      .status(statusCode)
      .send({ result: false, message: errorMessage, payload: null });
  },

  handleOK: (
    res,
    status = responseCode.OK,
    message = responseMessage.SUCCESS,
  ) => {
    return res.status(status).send({ result: true, message: message });
  },

  handleFile: (res, path, status = responseCode.OK) => {
    return res.status(status).sendFile(path);
  },

  handleData: (
    res,
    data,
    status = responseCode.OK,
    message = responseMessage.SUCCESS,
    token = null,
  ) => {
    return res.status(status).send({
      result: true,
      message: message,
      payload: data,
      token: token ? token : undefined,
    });
  },
};
