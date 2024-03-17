"use strict";

const IS_DEBUG =
  typeof process != "undefined" ? process.env.NODE_ENV == "development" : true;

/* only use console.log in development */
let console_log;
if (IS_DEBUG) {
  console_log = function (msg) {
    /*
    if (typeof msg != "string") {
      msg = JSON.stringify(msg);
    }
    */
    console.log(msg);
  };
} else {
  // dummy function
  console_log = function (msg) {};
}

/**
 * @param {*} x
 * @param {*} y
 * @returns {boolean}
 */
function isDifferent(x, y) {
  /* TODO: better (faster)
   */
  return JSON.stringify(x) != JSON.stringify(y);
}

/**
 * @param {object} defaultData
 * @returns {object}
 */
function getInitialDataWithStorage(defaultData) {
  const result = {};
  for (const [name, valueDefault] of Object.entries(defaultData)) {
    const strVal = localStorage.getItem(name);
    if (strVal) {
      const valueStorage = JSON.parse(strVal);
      console_log(`from storage: ${name} = ${strVal}`);
      result[name] = valueStorage;
    } else {
      result[name] = valueDefault;
    }
  }
  return result;
}

/**
 *
 * @param {*} key
 * @param {*} value
 */
function saveLocalStorage(key, value) {
  console_log(`Storing value ${key} = ${value}`);
  localStorage.setItem(key, JSON.stringify(value));
}

export {
  isDifferent,
  console_log,
  getInitialDataWithStorage,
  saveLocalStorage,
};
