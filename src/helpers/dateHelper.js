const moment = require('moment');
const {
  dateTimeFormat,
  timeFormat,
  longTimeFormat,
  dateFormat,
} = require('../../config/constants');

class DateHelper {
  static isOlderThanPeriod = (date, period, unit = 'months') => {
    const inputDate = moment(date);
    const currentDate = moment();
    const threshold = currentDate.clone().subtract(period, unit);
    return inputDate.isBefore(threshold);
  };

  static isValidDate = dateString => {
    return dateString && !isNaN(Date.parse(dateString));
  };

  /**
   * Get user's local date according to timezone. Use this to convert UTC timestamp back to local date.
   * @param {string} timezone User timezone
   * @param {string|Date} date A specific date with time. If absent, will use current date.
   * @returns {string} Date in YYYY-MM-DD format.
   */
  static getLocalDate(timezone, date = undefined) {
    return moment.utc(date).tz(timezone).format('YYYY-MM-DD');
  }

  /**
   * Get user's local datetime according to timezone. Use this to convert UTC timestamp back to local datetime.
   * @param {string} timezone User timezone
   * @param {string|Date} datetime A specific date with time. If absent, will use current date.
   * @returns {string} Date in YYYY-MM-DD HH:mm:ss format.
   */
  static getLocalDatetime(timezone, datetime = undefined) {
    return moment.utc(datetime).tz(timezone).format(dateTimeFormat);
  }

  /**
   * Get UTC representation of a time in the specific timezone. For example, if
   * you call this function with LA local time 8 am, it will return you the
   * corresponding UTC time. So getLocalMomentInUtc('America/Los_Angeles',
   * '2023-12-28 08:01:02').format will return '2023-12-28T16:01:02Z'.
   * @param {string} timezone Source timezone
   * @param {string} timestampStr A specific timestamp. Please note that you have to stick to the format, and do not pass ISO format timestamp, otherwise the conversion won't be correct.
   * @param {string} format timestampStr's format.
   * @returns {Object} A moment.js object in UTC.
   */
  static getLocalMomentInUtc(
    timezone,
    timestampStr,
    format = 'YYYY-MM-DD HH:mm:ss',
  ) {
    return moment.tz(timestampStr, format, timezone).utc();
  }

  static unixTimeConversion = time => {
    return moment.unix(time).format(dateTimeFormat);
  };

  /**
   * Get UTC Time
   * @param time
   * @return null|string
   */
  static getUtcDateTimeWithDefaultFormat = time => {
    return time ? moment.utc(time).format(dateTimeFormat) : null;
  };

  /**
   * Get Time
   * @param time
   * @return null|string
   */
  static getDateTimeWithDefaultFormat = time => {
    return time ? moment(time).format(dateTimeFormat) : null;
  };

  /**
   * Format date to YYYY-MM-DD format.
   * @param {string} date
   * @param {string=} sourceFormat
   * @returns {string|null}
   */
  static formatDate = (date, sourceFormat) => {
    return date ? moment(date, sourceFormat).format(dateFormat) : null;
  };

  /**
   * Format time to HH:mm format.
   * @param {string} time
   * @param {string} sourceFormat Like 'HHmm'.
   * @param {string} targetFormat Defaults to be HH:mm.
   * @returns {string|null}
   */
  static formatTime = (time, sourceFormat, targetFormat = timeFormat) => {
    return time ? moment(time, sourceFormat).format(targetFormat) : null;
  };

  static getTimeWithFormat = time => {
    return time ? moment(time, longTimeFormat).format(timeFormat) : null;
  };

  // Helper function to calculate the difference in minutes between two dates
  static getMinutesBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60));
  };

  /**
   * Adjusts the given start and end dates by extending them by a specified number of days before and after, respectively, based on the specified timezone.
   * @param {string} startDate The initial start date in a specific format.
   * @param {string} endDate The initial end date in a specific format.
   * @param {number} days The number of days to adjust the start and end dates.
   * @param {string} dateFormat The format of the dates.
   * @returns {Array<string>} An array containing the adjusted start and end dates in the specified format.
   */
  static adjustDateRangeByDays = (startDate, endDate, days, dateFormat) => {
    const adjustedStartDate = moment(startDate, dateFormat)
      .subtract(days, 'days')
      .format(dateFormat);
    const adjustedEndDate = moment(endDate, dateFormat)
      .add(days, 'days')
      .format(dateFormat);
    return [adjustedStartDate, adjustedEndDate];
  };

  /**
   * Check if the target timestamp is within range.
   * @param {Date|null} target
   * @param {Date} startTimestamp
   * @param {Date} endTimestamp
   * @returns {boolean}
   */
  static isInRange(target, startTimestamp, endTimestamp) {
    return target && target >= startTimestamp && target <= endTimestamp;
  }

  /**
   * Get the dates in 'YYYY-MM-DD' format in range.
   * @param {string} startDate in 'YYYY-MM-DD' format.
   * @param {string} endDate in 'YYYY-MM-DD' format.
   * @returns {string[]} An array of dates in 'YYYY-MM-DD' format.
   */
  static getDatesInRange(startDate, endDate) {
    const dateArray = [];
    const currentDate = moment(startDate);
    const stopDate = moment(endDate);
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }
    return dateArray;
  }

  /**
   * Checks if a given refresh token has expired, considering a buffer period.
   * @param {string|null|undefined} expiresAt - When the token will expire, or null/undefined if never exchanged token at all.
   * @param {number|undefined} bufferMinutes - The buffer period, in minutes, to consider before considering the token expired.
   * @returns {boolean} - Returns true if the refresh token has expired, otherwise false.
   */
  static isTokenExpired = (expiresAt, bufferMinutes = 2) => {
    if (!expiresAt) {
      return true;
    }
    const now = moment();
    const expirationTime = moment(expiresAt);
    const expirationWithBuffer = expirationTime.subtract(
      bufferMinutes,
      'minutes',
    );
    return now.isAfter(expirationWithBuffer);
  };

  /**
   * Get the maximum date between two dates.
   * @param {Date} date1 - The first date.
   * @param {Date} date2 - The second date.
   * @returns {Date} - The maximum date.
   */
  static getMaxDate = (date1, date2) => {
    return date1 > date2 ? date1 : date2;
  };

  /**
   * Function to convert RFC 3339 format
   * @param {string} dateString // format 'YYYY-MM-DD'
   * @param {string} timezone
   * @returns {string}
   */
  static toRfc3339Format = (dateString, timezone) => {
    let momentObj;
    if (!timezone) {
      momentObj = moment.utc(dateString, 'YYYY-MM-DD');
    } else {
      momentObj = moment(dateString, 'YYYY-MM-DD').tz(timezone);
    }
    return momentObj.format('YYYY-MM-DDTHH:mm:ssZ');
  };

  /**
   * Function to convert milliseconds to hours
   * @param {integer} ms
   * @param {integer} decimalPlaces
   * @returns {number}
   */
  static msToHours = (ms, decimalPlaces = 0) => {
    const msToHours = ms / (1000 * 60 * 60);
    if (decimalPlaces === 0) {
      return Math.round(msToHours);
    }
    return Number(msToHours.toFixed(decimalPlaces));
  };

  /**
   * Format the dateTime to unix format
   * @param {string} value
   * @returns {string}
   */
  static formatToUnix = value => {
    return moment(value).unix();
  };

  /**
   * Gets new expires_at value for db based on current timestamp.
   * @param {number} expiresInSeconds
   * @returns {string}
   */
  static getExpiresAt = expiresInSeconds => {
    return moment().add(expiresInSeconds, 'seconds').format(dateTimeFormat);
  };

  /**
   * Format date into American date format MM/DD/YYYY.
   * @param {string} date
   * @returns {string}
   */
  static formatToUsDate(date) {
    return date ? moment(date).format('MM/DD/YYYY') : null;
  }

  /**
   * Retrieves the local time for a given timezone and date.
   * @param {string} timezone The timezone for which to retrieve the local time.
   * @param {string|Date} [date] A specific date for which to retrieve the local time. If not provided, the current date will be used.
   * @returns {string} The local time in the format 'HH:mm:ss' for the given timezone and date.
   */
  static getLocalTime(timezone, date = undefined) {
    return moment.utc(date).tz(timezone).format(longTimeFormat);
  }

  /**
   * Converts a date string into a readable month name.
   * @param {string} monthString The date string in "YYYY-MM" format.
   * @returns {string} The full month name (e.g., "Jan").
   */
  static getMonthName = monthString => {
    const month = moment(monthString, 'YYYY-MM');
    if (month.isValid()) {
      return month.format('MMM');
    }
  };

  /**
   * Removes the time portion of a datetime.
   * @param {string} datetime
   * @returns {string};
   */
  static trimTime = datetime => {
    return datetime.substring(0, 10);
  };

  /**
   * Converts an ISO datetime string to a standard SQL datetime format (YYYY-MM-DD HH:MM:SS).
   * @param {string|null|undefined} isoDatetime The ISO 8601 formatted datetime string.
   * @returns {string|null|undefined} The formatted datetime string.
   */
  static parseIsoDatetime = isoDatetime => {
    return isoDatetime
      ? isoDatetime.substring(0, 19).replace('T', ' ')
      : isoDatetime;
  };
}

module.exports = DateHelper;
