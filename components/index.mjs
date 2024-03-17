class Component {
  constructor(parentId, id, dataName, tag) {
    this.parentId = parentId;
    this.id = id;
    this.dataName = dataName;
    this.tag = tag || "div";
    this.element = null; // in init();
  }

  createHtml(document) {
    if (document.getElementById(this.id)) {
      throw new Error(`Wlement already exists: ${this.id}`);
    }
    const parent = document.getElementById(this.parentId);
    if (!parent) {
      throw new Error(`Parent element does not exist: ${this.parentId}`);
    }
    const element = document.createElement(this.tag);
    element.id = this.id;

    parent.appendChild(element);
    if (this.dataName) {
      element.setAttribute("data-name", this.dataName);
    }
    return element;
  }

  createStaticHtml(document) {
    if (this.staticHtml) {
      this._createHtmlElement(document);
    }
  }

  init(document, app, createStaticHtml) {
    if (createStaticHtml) {
      this.createStaticHtml(document);
    }

    const element = document.getElementById(this.id);
    this.element = element;
    const dataName = element.getAttribute("data-name");
    const getValue = this.getValue;

    if (dataName && getValue) {
      element.addEventListener("change", (_event) => {
        app.setValue(dataName, getValue(element));
      });
    }

    const setValue = this.setValue;
    if (dataName && setValue) {
      app.addCallback([dataName], (value) => setValue(element, value));
    }
  }
}

class OutputComponent extends Component {
  setValue(element, value) {
    element.value = value;
  }
}

class InputComponent extends OutputComponent {
  getValue(element) {
    return element.value;
  }
}

class LabelOutputComponent extends OutputComponent {
  constructor(parentId, id, dataName) {
    const tag = "label";
    super(parentId, id, dataName, tag);
  }

  setValue(element, value) {
    element.textContent = value.toLocaleString("de-DE", {
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

  createHtml(document) {
    let element = super.createHtml(document);
    element.type = "number";
    element.min = this.min;
    element.max = this.max;
    return element;
  }

  getValue(element) {
    return parseInt(super.getValue(element));
  }

  setValue(element, value) {
    // clip to range
    value = Math.min(value, parseInt(element.max));
    value = Math.max(value, parseInt(element.min));
    return super.setValue(element, value);
  }
}

export {
  Component,
  IntInputComponent,
  LabelOutputComponent,
  InputComponent,
  OutputComponent,
};
