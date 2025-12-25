const db = require('../../models');
const axios = require('axios');
const _ = require('lodash');
const responseMessage = require('../helpers/responseMessage.js');
const moment = require('moment');
const crypto = require('crypto');
const {
  defaultPage,
  defaultPageSize,
  nodeServerUrlDev,
  nodeServerUrlProd,
} = require('../../config/constants');
const { Op } = require('sequelize');
const OauthAccessToken = db.OauthAccessToken;
const User = db.User;
const slackService = require('../services/notifications/slackService.js');
const path = require('path');
const { NotFoundError } = require('./customErrors');
const pino = require('../services/logging/pinoService.js');

class Helper {
  /**
   * DO NOT USE THIS FUNCTION ANYMORE!!! USE THE ONE DEFINED IN modelHelper.js INSTEAD.
   * @param {} userId
   * @returns
   */
  static getAuthCompanyId = async userId => {
    const userDetail = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ['admin_company_detail_id'], // Specify the attributes to retrieve
    });
    if (_.isNil(userDetail) || _.isNil(userDetail.admin_company_detail_id)) {
      throw responseMessage.ADMIN_COMPANY_ID_NOT_FOUND;
    }
    return userDetail.admin_company_detail_id;
  };

  /**
   * DO NOT USE THIS FUNCTION ANYMORE!!! USE THE ONE DEFINED IN modelHelper.js INSTEAD.
   * Retrieve user and company associated with the provided user ID.
   * @param {number} userId - The ID of the user whose associated company ID is to be retrieved.
   * @param {Array} [attributes=[]] - Optional. Attributes to retrieve from the user model. admin_company_detail_id is guaranteed to be retrieved.
   * @param {Array} [companyAttributes=[]] - Optional. Attributes to retrieve from the associated company model.
   * @returns {Promise<Object>} The user and optional company model.
   * @throws Throws an error if the user ID is invalid.
   */
  static getUserWithCompany = async (
    userId,
    attributes = ['admin_company_detail_id'],
    companyAttributes = [],
  ) => {
    if (!attributes.includes('admin_company_detail_id')) {
      attributes.push('admin_company_detail_id');
    }

    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: attributes, // Specify the attributes to retrieve
      include:
        companyAttributes.length > 0
          ? [
              {
                association: 'company',
                attributes: companyAttributes,
              },
            ]
          : undefined,
    });
    if (_.isNil(user)) {
      throw new NotFoundError(`User not found.`);
    }
    return user;
  };

  /**
   * Checks if an entity exists based on the provided model and where clause.
   * @param {Object} modelName - The model representing the entity.
   * @param {Object} [whereClause={}] - An object representing the conditions to find the entity.
   * @throws {NotFoundError} If the entity is not found.
   * @returns {Promise<void>} A Promise that resolves if the entity is found, otherwise rejects with a NotFoundError.
   */
  static checkLinkedEntity = async (modelName, whereClause = {}) => {
    const entity = await modelName.findOne({
      where: whereClause,
      attributes: ['id'],
    });
    if (!entity) {
      throw new NotFoundError(`${modelName.name} not found.`);
    }
    return;
  };

  static findKeyByValue = (obj, value) => {
    return Object.keys(obj).find(key => obj[key] === value);
  };

  static getKeyByValueOrNull = (obj, value) => {
    if (value !== null && value !== undefined) {
      return Object.keys(obj).find(key => obj[key] === value);
    }
    return null;
  };

  static findIntKeyByValue = (obj, value) => {
    return parseInt(Object.keys(obj).find(key => obj[key] === value));
  };

  static getIntKeyByValueOrNull = (obj, value) => {
    if (value !== null && value !== undefined) {
      return parseInt(Object.keys(obj).find(key => obj[key] === value));
    }
    return null;
  };

  /**
   * If key exists in obj, return obj[key]. Else return null.
   * @param obj
   * @param key
   */
  static getValueByKeyOrNull = (obj, key) => {
    if (key !== null && key !== undefined) {
      return obj[key];
    }
    return null;
  };

  /**
   * Call the callback to transform value, or return null if value is null or undefined.
   * @param callback
   * @param value
   */
  static getReturnValueOrNull = (callback, value) => {
    if (value !== null && value !== undefined) {
      return callback(value);
    }
    return null;
  };

  /**
   * Call the callback to transform value, or return undefined if value is null or undefined.
   * @param callback
   * @param value
   */
  static getReturnValueOrUndefined = (callback, value) => {
    if (value !== null && value !== undefined) {
      return callback(value);
    }
    return undefined;
  };

  /**
   * Checks if a value exists in the array. If the value is found, returns 1; otherwise, returns null.
   * @param {Array} array - The array to check for the condition.
   * @param {string|number} valueToCheck - The value to check for in the array.
   * @returns {number|null} Returns 1 if the value is found, otherwise returns null.
   */
  static findValueInArrayOrNull = (array, valueToCheck) => {
    if (array?.length > 0 && array.includes(valueToCheck)) {
      return 1;
    }
    return null;
  };

  /**
   * DO NOT USE THIS FUNCTION ANYMORE!!! USE THE ONE DEFINED IN modelHelper.js INSTEAD.
   * Update an object (like a model) if the fields are changed in payload.
   * @param {Object} target - Object to update.
   * @param {Object} source - Object containing possible changes, like API payload.
   * @param {string[]|string[][]} fields - Names of the fields to update.
   * Use a single string if the field name is the same in both target and source.
   * Otherwise, use an array of two strings: [targetFieldname, sourceFieldname].
   */
  static updateOnNeed = (target, source, fields) => {
    for (const field of fields) {
      if (typeof field === 'string') {
        this._updateOnNeed(target, source, field, field);
      } else if (Array.isArray(field) && field.length == 2) {
        const [targetField, sourceField] = field;
        this._updateOnNeed(target, source, targetField, sourceField);
      } else {
        throw Error(
          'Each item in fields shall be either a string or an array of two strings.',
        );
      }
    }
  };

  /**
   * Update an object (like a model) if the field is changed in payload.
   * @param {Object} target - Object to update.
   * @param {Object} source - Object containing possible changes, like API payload.
   * @param {string} targetField - Target field name.
   * @param {string} sourceField - Source field name.
   */
  static _updateOnNeed = (target, source, targetField, sourceField) => {
    if (
      source[sourceField] !== undefined &&
      target[targetField] !== source[sourceField]
    ) {
      target[targetField] = source[sourceField];
    }
  };

  static isValidAccessToken = async (oAuthId, userId) => {
    try {
      // TODO: I am confused here. Why are we using count? We only need to know
      // Ans- Because we don’t need any data from table OauthAccessToken,
      // we need to check whether that matched data is available or not.
      // Counting the number of records is generally faster than retrieving all
      // the data for a single record because the database doesn't need to fetch
      // and transmit the actual record content. It only needs to perform a simple
      // count operation based on the provided conditions.
      // if one exist, and why is it possible to have more than 1?
      return await OauthAccessToken.count({
        where: {
          id: oAuthId,
          revoked: 0,
          user_id: parseInt(userId),
          expires_at: {
            [Op.gt]: new Date(),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  };

  static getCurrentAdminCompanyDetail = async userId => {
    try {
      return await User.findOne({
        where: {
          id: userId,
        },
        include: {
          association: 'company',
          attributes: ['id', 'business_name', 'company_type'],
        },
        attributes: ['id', 'admin_company_detail_id'],
      });
    } catch (error) {
      throw error;
    }
  };

  static generateUniqueFileName = (companyId, userId, indexId, extension) => {
    const timestamp = moment().format('YYYYMMDD-HHmmss');
    const hrtime = process.hrtime.bigint();
    const random = crypto.randomBytes(8).toString('hex');
    const lowerCaseExtension = extension.toLowerCase();
    let postfix = `${timestamp}-${hrtime}-${random}.${lowerCaseExtension}`;
    if (indexId !== null) {
      postfix = `${indexId}-${postfix}`;
    }
    if (userId !== null) {
      postfix = `${userId}-${postfix}`;
    }
    if (companyId !== null) {
      postfix = `${companyId}-${postfix}`;
    }
    return postfix;
  };

  static getHttpWithHeaderResponse = async (url, authorization) => {
    try {
      let config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
      };
      let response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error.message;
    }
  };

  static getHttpResponse = async url => {
    try {
      let config = {
        method: 'get',
        url: url,
      };
      let response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error.message;
    }
  };

  /** Technical debt: Move to DateHelper **/
  static getIsoDate = () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  };

  /**
   * Pagination For Sequelize
   * @param items
   * @param pageNumber
   * @param pageSize
   * @return object
   */
  static paginate = (items, pageNumber = 1, pageSize = 50) => {
    return {
      currentPage: pageNumber,
      totalPage: Math.ceil(items.count / pageSize),
      totalItems: items.count,
      perPage: pageSize,
    };
  };

  /**
   * Pagination For Sequelize
   * @param items
   * @param pageNumber
   * @param pageSize
   * @return object
   */
  static paginateWithItemsArray = (items, pageNumber = 1, pageSize = 25) => {
    let itemsCount = items.length;

    return {
      currentPage: pageNumber,
      totalPage: Math.ceil(itemsCount / pageSize),
      totalItems: itemsCount,
      perPage: pageSize,
    };
  };

  /**
   * Calculate pagination. Paging will only be turned on if one of currentPage and pageSize is set.
   * @param {*} currentPage Paging request from API payload.
   * @param {*} pageSize Paging request from API payload.
   * @param {number|undefined} defaultPageSizeToUse Use this default page size instead of system's default size 50.
   * @returns
   */
  static getPagination = (currentPage, pageSize, defaultPageSizeToUse) => {
    let pagination = true;
    if (!pageSize && !currentPage) {
      pagination = false;
    }
    const page = this.getPage(currentPage);
    const limit = this.getPageSize(pageSize, defaultPageSizeToUse);
    const offset = (page - 1) * limit;
    return { page, limit, offset, pagination };
  };

  static getLoadDriverIds = drivers => {
    if (drivers.length) {
      return _.uniq(
        drivers
          .flatMap(a => {
            if (a && a.driver_ids) {
              return a.driver_ids.split(',');
            }
          })
          .filter(a => a),
      );
    }
    return [];
  };

  static getPage = page => {
    if (page) {
      return parseInt(page);
    }
    return defaultPage;
  };

  static getPageSize = (pageSize, defaultPageSizeToUse) => {
    if (pageSize) {
      return parseInt(pageSize);
    }
    if (defaultPageSizeToUse) {
      return defaultPageSizeToUse;
    }
    return defaultPageSize;
  };

  static splitStringToArray = (value, separator = ',') => {
    if (value !== null && value !== undefined) {
      return value.split(separator);
    }
    return [];
  };

  static getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.PROD_BASE_URL;
    } else {
      return process.env.DEV_BASE_URL;
    }
  };

  /**
   *
   * @returns This node.js server's url, ended with 'api/'.
   */
  static getNodeServerUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return nodeServerUrlProd;
    } else {
      return nodeServerUrlDev;
    }
  };

  static slackNotification = async errorMsg => {
    await slackService.sendToSlack(errorMsg);
  };

  /**
   * Log error message to Pino and optionally Slack.
   * @param {Object} err Object for error, for example thrown by external API.
   * @param {string} slackMsg Optional message to Slack.
   */
  static logErrMsg = (err, slackMsg) => {
    let msg = 'ERROR: caught in logErrMsg: ';
    if (typeof err === 'object' && err.response?.data) {
      msg += JSON.stringify(err.response.data) + ' ';
    }
    pino.logger.error(err, msg);
    if (slackMsg) {
      this.slackNotification(slackMsg);
    }
  };

  static userFullName = user => {
    let fullName = '';
    if (user) {
      fullName = (user.first_name || '') + ' ' + (user.last_name || '');
    }
    return fullName.trim();
  };

  /**
   * Generate the path of a file on server.
   * @param {string} dir The directory starting from root, for example 'files'.
   * @param {string} file The filename.
   * @returns {string} File path.
   */
  static getFilePath(dir, file) {
    return path.join(__dirname, '../../', dir, file);
  }

  /**
   * Checks if an array contains duplicate items.
   * @param {array} items
   * @returns {boolean}
   */
  static containsDuplicates(items) {
    const uniqueItems = new Set(items.map(id => String(id))); // Convert all values to String for comparison
    return uniqueItems.size !== items.length;
  }

  /**
   * Checks if a string contains only whitespace characters.
   * @param {string} name
   * @returns {boolean}
   */
  static containsOnlyWhitespace(name) {
    return /^\s*$/.test(name);
  }

  /**
   * Generates a response object for customer
   *
   * @param {object | null | undefined} customer
   * @param {string | null | undefined} customerName
   * @returns {object}
   */
  static formatCustomer = (customer, companyName = null) => {
    if (!_.isNil(customer)) {
      return {
        id: customer.id,
        name: customer.company_name,
      };
    } else if (!_.isNil(companyName)) {
      return {
        id: null,
        name: companyName,
      };
    } else {
      return customer;
    }
  };

  /**
   * Function to convert meters to miles
   * @param {integer} meters
   * @param {integer} decimalPlaces
   * @returns {number}
   */
  static metersToMiles = (meters, decimalPlaces = 0) => {
    const miles = meters / 1609.344;
    if (decimalPlaces === 0) {
      return Math.round(miles);
    } else {
      return Number(_.round(miles, decimalPlaces));
    }
  };

  /**
   * Function to convert milliliters to gallons
   * @param {integer} ml
   * @param {integer} decimalPlaces
   * @returns {number}
   */
  static millilitersToGallons = (ml, decimalPlaces = 0) => {
    const gallon = ml / 3785.41; // 1 gallon = 3785.41 milliliters
    return _.round(gallon, decimalPlaces);
  };

  /**
   * If num is null/undefined, return num. Else round to fixed decimals. This code actually uses _.round().
   * @param {number|string|null|undefined} num
   * @param {number|undefined} decimalPlaces
   * @returns {number|null|undefined}
   */
  static roundOrNil = (num, decimalPlaces = 2) => {
    if (_.isNil(num)) {
      return num;
    }
    return _.round(num, decimalPlaces);
  };

  /**
   * Divide or return defaultIfNan when divisor is not a number. This code uses _.divide().
   * @param {number|string} dividend
   * @param {number|string} divisor
   * @param {number=} defaultIfNan Defaul to return 0 if divisor is 0 or null or undefined.
   * @returns
   */
  static divideOrDefault = (dividend, divisor, defaultIfNan = 0) => {
    if (_.isNil(divisor) || divisor == 0) {
      return defaultIfNan;
    }
    return _.divide(dividend, divisor);
  };

  /**
   * Create a new object with specified property or Null.
   * @param {string} propertyName - The name of the property.
   * @param {any} value - The value of the property.
   * @returns {Object|null} - The formatted object, or null if value is null or undefined.
   */
  static newObjWithPropOrNull = (propertyName, value) => {
    if (!_.isNil(value)) {
      return { [propertyName]: value };
    }
    return null;
  };

  /**
   * transformData data by replacing object keys with shorter field mappings.
   *
   * @param {Object|Array} data
   * @param {Object} fieldMapping
   * @returns {Object|Array}
   */
  static transformData = (data, fieldMapping) => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.transformData(item, fieldMapping));
    }

    return Object.entries(data).reduce((compressed, [key, value]) => {
      const compressedKey = fieldMapping[key] || key;
      compressed[compressedKey] = this.transformData(value, fieldMapping);
      return compressed;
    }, {});
  };

  /**
   * Sleeps given ms period.
   * @param {number} ms
   * @returns
   */
  static sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * Recursively converts all keys in an object or array of objects to camelCase.
   * @param {Object|Array} entity The input object or array to transform.
   * @returns {Object|Array} A new object or array with camelCase keys.
   */
  static convertKeysToCamelCase = entity => {
    if (entity === null || typeof entity !== 'object') {
      return entity;
    }

    if (Array.isArray(entity)) {
      return entity.map(item => Helper.convertKeysToCamelCase(item));
    }

    return Object.keys(entity).reduce((acc, key) => {
      let camelKey = key;

      if (_.isString(key)) {
        // Check if the key looks like an acronym (all uppercase, optionally ending with a lowercase 's')
        // e.g., "DUNs", "HTTPS", "VATs", "ID"
        if (/^[A-Z]+s?$/.test(key)) {
          // Lowercase the entire acronym to treat it as a single word
          // e.g., "DUNs" → "duns", "HTTPS" → "https"
          camelKey = key.toLowerCase();
        } else {
          camelKey = _.camelCase(key);
        }
      }

      acc[camelKey] = Helper.convertKeysToCamelCase(entity[key]);
      return acc;
    }, {});
  };
}

module.exports = Helper;
