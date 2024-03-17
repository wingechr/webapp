"use strict";

import {
  console_log,
  getInitialDataWithStorage,
  saveLocalStorage,
} from "./utils.mjs";
import { DataGraph } from "./dataGraph.mjs";

class App {
  constructor(data, functions, ui, createStaticHtml) {
    this.defaultData = data;
    this.ui = ui;
    this.createStaticHtml = createStaticHtml;

    /* create app without UI */
    console_log("INIT APP");
    this.graph = new DataGraph();

    // add data nodes
    for (const name in this.defaultData) {
      this.graph.addNode(name);
    }

    // add functions
    for (const { name, dependencies, callable } of functions) {
      this.graph.addFunction(name, dependencies, callable);
    }
  }

  init(window) {
    let initialData = this.defaultData;
    if (window) {
      console_log("INIT UI");
      for (const component of this.ui) {
        component.init(window, this.graph, this.createStaticHtml);

        // also bind storage
        if (component.dataName && component.getValue) {
          this.graph.addCallback([component.dataName], (value) =>
            saveLocalStorage(component.dataName, value),
          );
        }
      }

      initialData = getInitialDataWithStorage(initialData); // only in UI
      window.app = this; // export to browser
    }

    console_log("INIT DATA");
    this.graph.setData(initialData);
    console_log("READY");

    return this;
  }
}

export { App };
