import { assert } from "chai";
import { describe, it } from "mocha";

import app from "./main.mjs";

describe("App", () => {
  it("can be loaded without UI", () => {
    assert.isTrue(typeof app !== "undefined");
  });
});
