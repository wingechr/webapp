"use strict";
import { console_log, isDifferent } from "./utils.mjs";

/**
 *
 */
export class DataGraph {
  /**
   *
   */
  constructor() {
    this._nodes = {}; // object[name, node object]:
    // array[string]: ordered array of names of (mutable) function nodes
    this._updateSequence = [];
    this._callbacks = []; // array[callback object]
  }

  /**
   * get current value of a node
   * @param {string} name
   * @returns {*}
   */
  _getNodeValue(name) {
    return this._nodes[name].value;
  }

  /**
   * set new value for a node
   * @param {string} name
   * @param {*} value
   */
  _setNodeValue(name, value) {
    this._nodes[name].value = value;
  }

  /**
   *
   * @param {string} name
   * @param {*} value
   */
  setValue(name, value) {
    const data = {};
    data[name] = value;
    this.setData(data);
  }

  /**
   *
   * @param {string} name
   * @returns {*}
   */
  getValue(name) {
    return this._getNodeValue(name);
  }

  /**
   * set multiple node values
   * @param {object} data
   */
  setData(data) {
    // set of nodes that have changed
    const changedNodes = new Set();

    /**
     * only change node if data actually changed
     * @param {string} name
     * @param {*} value
     */
    const _changeNodeIfValueChanged = (name, value) => {
      let oldValue = this._getNodeValue(name);
      if (isDifferent(oldValue, value)) {
        this._setNodeValue(name, value);
        console_log(`updating ${name} to: ${JSON.stringify(value)}`);
        changedNodes.add(name);
      }
    };

    // all data entries must be existing nodes without update functions
    for (const [name, value] of Object.entries(data)) {
      // node must exist
      if (!this._nodes[name]) {
        throw new Error(`Invalid node name: ${name}`);
      }
      // can not set data on calculated node
      if (this._nodes[name]["dependencies"]) {
        throw new Error(`${name} can not be set because it is calculated`);
      }
      _changeNodeIfValueChanged(name, value);
    }

    // find all function nodes that are affected
    for (const name of this._updateSequence) {
      const node = this._nodes[name];
      const dependencies = node.dependencies;
      if (dependencies.some((p) => changedNodes.has(p))) {
        const fun = node.callable;
        const args = dependencies.map((p) => this._getNodeValue(p));
        const value = fun(...args);
        _changeNodeIfValueChanged(name, value);
      }
    }

    /* callbacks after everything is finished
       some callbacks are triggered by multiple nodes, make sure to call them only once
    */
    const calledCallbackIndices = new Set();
    for (const name of changedNodes) {
      const node = this._nodes[name];
      for (const callbackIndex of node.callbackIndices) {
        if (!calledCallbackIndices.has(callbackIndex)) {
          calledCallbackIndices.add(callbackIndex);
          const { callback, dependencies } = this._callbacks[callbackIndex];
          const args = dependencies.map((p) => this._getNodeValue(p));
          callback(...args);
        }
      }
    }
  }

  /**
   *
   * @param {string} name
   * @param {array} dependencies
   * @param {function} callable
   */
  addFunction(name, dependencies, callable) {
    if (!dependencies) {
      throw new Error(`function without dependencies`);
    }
    if (!callable) {
      throw new Error(`missing function`);
    }
    console_log(`DG: add function: ${name}(${dependencies})`);

    this.addNode(name);
    const node = this._nodes[name];
    node.dependencies = dependencies;
    node.callable = callable;

    for (const p of dependencies) {
      if (!this._nodes[p]) {
        throw new Error(`${p} has not been defined`);
      }
    }
    this._updateSequence.push(name);
  }

  /**
   *
   * @param {string} name
   */
  addNode(name) {
    if (this._nodes[name]) {
      throw new Error(`${name} already exists`);
    }

    // init node object
    console_log(`DG: add node: ${name}`);
    const node = {
      name: name,
      value: null,
      callbackIndices: [],
    };
    this._nodes[name] = node;
  }

  /**
   *
   * @param {*} dependencies
   * @param {*} callable
   */
  addCallback(dependencies, callable) {
    const callbackIndex = this._callbacks.length;
    this._callbacks.push({
      dependencies: dependencies,
      callback: callable,
    });
    for (const name of dependencies) {
      if (!this._nodes[name]) {
        throw new Error(`Invalid node name: ${name}`);
      }
      this._nodes[name].callbackIndices.push(callbackIndex);
    }
  }
}
