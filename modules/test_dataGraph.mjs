import { assert } from "chai";
import { describe, it } from "mocha";
import { DataGraph } from "./dataGraph.mjs";

describe("DataGraph", () => {
  it("should refuse duplicate names", () => {
    let dg = new DataGraph();

    dg.addNode("d1");

    assert.throw(
      () => {
        dg.addNode("d1");
      },
      Error,
      /already exists/,
    );
  });

  it("should require dependendies to exist", () => {
    let dg = new DataGraph();

    assert.throw(
      () => {
        dg.addFunction("d2", ["d1"], (x) => x);
      },
      Error,
      /d1 has not been defined/,
    );
  });

  it("should update properly", () => {
    let dg = new DataGraph();

    dg.addNode("p1");
    dg.addFunction("f1", ["p1"], (p1) => p1 + 1);
    dg.addFunction("f2", ["f1"], (f1) => f1 * 0); // f1 always returns 0
    dg.addFunction("f3", ["f2"], (f2) => f2 + 1);

    // register callback for all changes
    const callbackSequence = [];
    dg.addCallback(["f1"], (f1) => {
      callbackSequence.push(["f1", f1]);
    });
    dg.addCallback(["f2"], (f2) => {
      callbackSequence.push(["f2", f2]);
    });
    dg.addCallback(["f3"], (f3) => {
      callbackSequence.push(["f3", f3]);
    });

    dg.setValue("p1", 1);
    dg.setValue("p1", 2);

    assert.deepEqual(callbackSequence, [
      ["f1", 2],
      ["f2", 0],
      ["f3", 1],
      ["f1", 3],
      // f3: not called again, because f2 has not changed
      // f3: not called again, because f2 has not changed
    ]);
  });
});
