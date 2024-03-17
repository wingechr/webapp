import { assert } from "chai";
import { describe, it } from "mocha";
import { App } from "./app.mjs";
import { LabelOutputComponent } from "../components/index.mjs";

describe("App", () => {
  it("should work without window", () => {
    const data = { d1: 2 };
    const functions = [
      {
        name: "f1",
        dependencies: ["d1"],
        callable: (p1) => p1 * p1,
      },
    ];
    const ui = [new LabelOutputComponent("main", "id1", "f1")];
    const app = new App(data, functions, ui);

    // init not called yet
    assert.equal(app.graph.getValue("f1"), undefined);

    app.init();

    assert.equal(app.graph.getValue("f1"), 2 * 2);
  });
});
