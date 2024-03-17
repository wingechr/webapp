class Component {
  constructor(parentId, id, dataName, tag) {
    this.parentId = parentId;
    this.id = id;
    this.dataName = dataName;
    this.tag = tag || "div";
    this.element = null; // in init();
  }

  createHtml(window) {
    if (window.document.getElementById(this.id)) {
      throw new Error(`Wlement already exists: ${this.id}`);
    }
    const parent = window.document.getElementById(this.parentId);
    if (!parent) {
      throw new Error(`Parent element does not exist: ${this.parentId}`);
    }
    const element = window.document.createElement(this.tag);
    element.id = this.id;

    parent.appendChild(element);
    if (this.dataName) {
      element.setAttribute("data-name", this.dataName);
    }
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
  constructor(parentId, id, dataName) {
    const tag = "label";
    super(parentId, id, dataName, tag);
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
  constructor(parentId, id, dataName, min, max) {
    const tag = "input";
    super(parentId, id, dataName, tag);
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
    value = Math.min(value, parseInt(self.element.max));
    value = Math.max(value, parseInt(self.element.min));
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
