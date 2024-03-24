"use strict";

import {
  console_log,
  getInitialDataWithStorage,
  saveLocalStorage,
} from "./utils.mjs";
import { DataGraph } from "./dataGraph.mjs";

class App {
  /**
   *
   * @param {object} data
   * @param {array} functions
   */
  constructor(data, functions) {
    this.defaultData = data;
    this.uiComponents = {};

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

  /**
   * @param {Window} window
   * @param {array} uiComponents
   * @param {boolean} createHtml
   * @returns {App}
   */
  init(window, uiComponents, createHtml) {
    let initialData = this.defaultData;
    if (window) {
      console_log("INIT UI");
      for (const component of uiComponents) {
        this.uiComponents[component.id] = this.uiComponents;

        component.init(window, this.graph, createHtml);

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
