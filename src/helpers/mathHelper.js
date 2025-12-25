const _ = require('lodash');
const { InternalServerError } = require('./customErrors');

/**
 * Function to convert meters to miles
 * @param {integer} meters
 * @param {integer} decimalPlaces
 * @returns {number}
 */
const metersToMiles = (meters, decimalPlaces = 0) => {
  const miles = meters / 1609.344;
  if (decimalPlaces === 0) {
    return Math.round(miles);
  } else {
    return Number(_.round(miles, decimalPlaces));
  }
};

/**
 * A shortcut to _.round().
 * @param {number|string} num
 * @param {number=} decimalPlaces Defaults to be 2.
 * @returns {number}
 */
const round = (num, decimalPlaces = 2) => {
  return _.round(num, decimalPlaces);
};

/**
 * If num is null/undefined, return num. Else round to fixed decimals. This code actually uses _.round().
 * @param {number|string|null|undefined} num
 * @param {number|undefined} decimalPlaces
 * @returns {number|null|undefined}
 */
const roundOrNil = (num, decimalPlaces = 2) => {
  if (_.isNil(num)) {
    return num;
  }
  return _.round(num, decimalPlaces);
};

/**
 * Rounds and format to string. 1234 will be "1,234.00" if decimalPlaces is 2.
 * @param {number|string} num
 * @param {number=} decimalPlaces Defaults to be 2.
 * @returns {string}
 */
const roundToStr = (num, decimalPlaces = 2) => {
  return Number(_.round(num, decimalPlaces)).toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

/**
 * Divide or return defaultIfNan when divisor is not a number. This code uses _.divide().
 * @param {number|string} dividend
 * @param {number|string} divisor
 * @param {number=} defaultIfNan Defaul to return 0 if divisor is 0 or null or undefined.
 * @returns
 */
const divideOrDefault = (dividend, divisor, defaultIfNan = 0) => {
  if (_.isNil(divisor) || divisor == 0) {
    return defaultIfNan;
  }
  return _.divide(dividend, divisor);
};

/**
 * Convert latitude and longitude from decimals to degrees, minutes, and seconds (DMS) format.
 * @param {number} lat Latitude in decimal degrees.
 * @param {number} lng Longitude in decimal degrees.
 * @returns {object} Object containing latitude and longitude in DMS format along with direction identifiers.
 */
const decimalToDms = (lat, lng) => {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  const latDms = _convertCoord(lat);
  const lngDms = _convertCoord(lng);
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';

  return { latDms, lngDms, latDirection, lngDirection };
};

const _convertCoord = coord => {
  const absoluteCoord = Math.abs(coord);
  const degrees = Math.floor(absoluteCoord);
  let minutes = Math.floor((absoluteCoord - degrees) * 60);
  let seconds = Math.floor(((absoluteCoord - degrees) * 60 - minutes) * 60);
  // Should not happen, just put here to make sure we won't produce 60.
  if (minutes >= 60) {
    minutes = 59;
  }
  if (seconds >= 60) {
    seconds = 59;
  }
  const degreesPadded = degrees.toString().padStart(3, '0');
  const minutesPadded = minutes.toString().padStart(2, '0');
  const secondsPadded = seconds.toString().padStart(2, '0');
  return `${degreesPadded}${minutesPadded}${secondsPadded}`;
};

/**
 * Converts weight from one unit to another based on predefined conversion factors.
 * @param {number} weight The weight value to be converted.
 * @param {string} unit The current unit of the weight.
 * @param {string} targetUnit The target unit to convert the weight to.
 * @returns {number} The converted weight in the target unit.
 */
const convertWeightToTargetUnit = (weight, unit, targetUnit) => {
  const conversionFactors = {
    kg: { lbs: 2, ton: 0.001 },
    lbs: { ton: 0.0005, lbs: 1 },
    lb: { ton: 0.0005, lbs: 1 },
    ton: { lbs: 2000, ton: 1 },
  };
  return conversionFactors[unit]?.[targetUnit]
    ? (parseFloat(weight) || 0) * conversionFactors[unit][targetUnit]
    : 0;
};

/**
 * Extracts the first integer in the given string.
 * @param {string} str
 * @returns {number|null} Null if not found.
 */
const extractFirstInt = str => {
  const match = str.match(/\d+/); // Find the first sequence of digits
  return match ? parseInt(match[0], 10) : null; // Convert to integer or return null if no match
};

module.exports = {
  metersToMiles,
  round,
  roundOrNil,
  roundToStr,
  divideOrDefault,
  decimalToDms,
  convertWeightToTargetUnit,
  extractFirstInt,
};
