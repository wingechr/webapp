import { assert } from "chai";
import { describe, it } from "mocha";
import { App } from "./app.mjs";
import { JSDOM } from "jsdom";
import Storage from "dom-storage";

describe("App", () => {
  const data = { d1: 2 };
  const functions = [
    {
      name: "f1",
      dependencies: ["d1"],
      callable: (p1) => p1 * p1,
    },
  ];
  const uiComponents = [];

  it("should work without window", () => {
    const app = new App(data, functions);

    // init not called yet
    assert.throw(() => {
      app.graph.getValue("f1");
    });

    app.init();

    assert.equal(app.graph.getValue("f1"), 2 * 2);
  });

  it("should work with window", () => {
    const app = new App(data, functions);

    const dom = new JSDOM('<html><body id="main"></body></html>');
    global.localStorage = new Storage(null, { strict: true });
    app.init(dom.window, uiComponents, true);

    assert.equal(app.graph.getValue("f1"), 2 * 2);
  });
});
