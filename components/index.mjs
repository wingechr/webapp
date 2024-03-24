const nameAttributeName = "data-name";

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
  }

  /**
   * create static HTML
   * !! Do not attach javascript events here, this should be done in init()
   * @param {Window} window
   * @returns {HTMLElement}
   */
  createHtml(window) {
    if (window.document.getElementById(this.id)) {
      throw new Error(`Wlement already exists: ${this.id}`);
    }
    const parent = window.document.getElementById(this.parentId);
    if (!parent) {
      throw new Error(`Parent element does not exist: ${this.parentId}`);
    }

    // create element
    const element = window.document.createElement(this.tag);
    // set classes
    element.classList.add(...this.classList);

    // set properties and attributes
    for (const [key, val] of Object.entries(this.properties)) {
      element[key] = val;
    }
    for (const [key, val] of Object.entries(this.attributes)) {
      element.setAttribute(key, val);
    }

    // add to parent
    parent.appendChild(element);

    return element;
  }

  /**
   * attach javascript when starting up the app
   * @param {Window} window
   * @param {App} app
   * @param {boolean} createHtml
   * @returns {HTMLElement}
   */
  init(window, app, createHtml) {
    if (createHtml) {
      this.createHtml(window);
    }

    const element = window.document.getElementById(this.id);
    this.element = element;
    const dataName = element.getAttribute(nameAttributeName);
    const getValue = this.getValue;

    if (dataName && getValue && this.eventName) {
      element.addEventListener(this.eventName, (_event) => {
        app.setValue(dataName, getValue(this));
      });
    }

    const setValue = this.setValue;
    if (dataName && setValue) {
      app.addCallback([dataName], (value) => setValue(this, value));
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

class LabelOutputComponent extends OutputComponent {
  constructor(parentId, id, classList, dataName) {
    const tag = "label";
    super(parentId, tag, id, classList, dataName);
  }

  setValue(self, value) {
    self.element.textContent = value.toLocaleString("de-DE", {
      useGrouping: true,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }
}

class IntInputComponent extends InputComponent {
  constructor(parentId, id, classList, dataName, min, max) {
    const tag = "input";
    super(parentId, tag, id, classList, dataName, { min: min, max: max });
    this.min = min;
    this.max = max;
  }

  createHtml(window) {
    let element = super.createHtml(window);
    element.type = "number";
    element.min = this.min;
    element.max = this.max;
    return element;
  }

  getValue(self) {
    return parseInt(super.getValue(self));
  }

  setValue(self, value) {
    // clip to range
    value = Math.min(value, self.max);
    value = Math.max(value, self.min);
    return super.setValue(self, value);
  }
}

export {
  Component,
  IntInputComponent,
  LabelOutputComponent,
  InputComponent,
  OutputComponent,
};
