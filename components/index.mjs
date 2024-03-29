import { DataGraph } from "../index.mjs";

const nameAttributeName = "data-name";

export function createHtml(
  window,
  parentId,
  tag,
  id,
  classList,
  properties,
  attributes,
) {
  if (window.document.getElementById(id)) {
    throw new Error(`Wlement already exists: ${id}`);
  }
  const parent = window.document.getElementById(parentId);
  if (!parent) {
    throw new Error(`Parent element does not exist: ${parentId}`);
  }

  // create element
  const element = window.document.createElement(tag);
  // set classes
  if (classList) {
    element.classList.add(...classList);
  }

  // set properties and attributes
  if (properties) {
    for (const [key, val] of Object.entries(properties)) {
      element[key] = val;
    }
  }
  if (attributes) {
    for (const [key, val] of Object.entries(attributes)) {
      element.setAttribute(key, val);
    }
  }

  // add to parent
  parent.appendChild(element);

  return element;
}

class Component {
  /**
   *
   * @param {string} parentId
   * @param {string} tag
   * @param {string} id
   * @param {array} classList
   * @param {string} dataName
   * @param {object} properties
   * @param {object} attributes
   * @param {string} eventName
   */
  constructor(
    parentId,
    tag,
    id,
    classList,
    dataName,
    properties,
    attributes,
    eventName,
  ) {
    this.parentId = parentId;
    this.id = id;
    this.dataName = dataName;
    this.eventName = eventName || "change";
    this.tag = tag || "div";
    this.properties = properties || {};
    this.attributes = attributes || {};
    this.properties["id"] = id;
    this.classList = classList || [];
    if (dataName) {
      this.attributes[nameAttributeName] = dataName;
    }
    /**
     * @type {HTMLElement}
     */
    this.element = null; // in init();
    this.childCount = 0; // for auto generating child ids in getNextChildId
  }

  getNextChildId(suffix) {
    this.childCount += 1;
    // 3 digit zero padded
    const num = this.childCount.toString().padStart(3, "0");
    let result = `${this.id}-${num}`;
    if (suffix) {
      result += suffix;
    }
    return result;
  }
  /**
   * create static HTML
   * !! Do not attach javascript events here, this should be done in init()
   * @param {Window} window
   * @returns {HTMLElement}
   */
  createHtml(window) {
    return createHtml(
      window,
      this.parentId,
      this.tag,
      this.id,
      this.classList,
      this.properties,
      this.attributes,
    );
  }

  /**
   * attach javascript when starting up the app
   * @param {Window} window
   * @param {DataGraph} dataGraph
   * @param {boolean} createHtml
   * @returns {HTMLElement}
   */
  init(window, dataGraph, createHtml) {
    if (createHtml) {
      this.createHtml(window);
    }

    const element = window.document.getElementById(this.id);
    this.element = element;
    const dataName = element.getAttribute(nameAttributeName);
    const getValue = this.getValue;

    if (dataName && getValue && this.eventName) {
      element.addEventListener(this.eventName, (_event) => {
        dataGraph.setValue(dataName, getValue(this));
      });
    }

    const setValue = this.setValue;
    if (dataName && setValue) {
      dataGraph.addCallback([dataName], (value) => setValue(this, value));
    }

    // user init HTML
    this.initHtml(element);

    return element;
  }

  /**
   * user init
   * @param {HTMLElement} element
   */
  initHtml(element) {}
}

class OutputComponent extends Component {
  /**
   *
   * @param {Component} self
   * @param {*} value
   */
  setValue(self, value) {
    self.element.value = value;
  }
}

class InputComponent extends OutputComponent {
  /**
   *
   * @param {Component} self
   * @returns {*}
   */
  getValue(self) {
    return self.element.value;
  }
}

export { Component, InputComponent, OutputComponent };
