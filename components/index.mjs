class Component {
  constructor(parentId, tag, id, className, dataName, properties, attributes) {
    this.parentId = parentId;
    this.id = id;
    this.dataName = dataName;
    this.tag = tag || "div";
    this.element = null; // in init();
    this.properties = properties || {};
    this.attributes = attributes || {};
    this.properties["id"] = id;
    this.properties["className"] = className;
    if (dataName) {
      this.attributes["data-name"] = dataName;
    }
  }

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

  init(window, app, createStaticHtml) {
    if (createStaticHtml) {
      this.createHtml(window);
    }

    const element = window.document.getElementById(this.id);
    this.element = element;
    const dataName = element.getAttribute("data-name");
    const getValue = this.getValue;

    if (dataName && getValue) {
      element.addEventListener("change", (_event) => {
        app.setValue(dataName, getValue(this));
      });
    }

    const setValue = this.setValue;
    if (dataName && setValue) {
      app.addCallback([dataName], (value) => setValue(this, value));
    }

    return this;
  }
}

class OutputComponent extends Component {
  setValue(self, value) {
    self.element.value = value;
  }
}

class InputComponent extends OutputComponent {
  getValue(self) {
    return self.element.value;
  }
}

class LabelOutputComponent extends OutputComponent {
  constructor(parentId, id, className, dataName) {
    const tag = "label";
    super(parentId, tag, id, className, dataName);
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
  constructor(parentId, id, className, dataName, min, max) {
    const tag = "input";
    super(parentId, tag, id, className, dataName, { min: min, max: max });
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
