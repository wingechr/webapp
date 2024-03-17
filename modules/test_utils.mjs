import { assert } from "chai";
import { describe, it } from "mocha";
import { isDifferent } from "./utils.mjs";

describe("isDifferent", () => {
  it("should be false for same number", () => {
    assert.equal(isDifferent(2.0 / 2, 1.0), false);
  });
  it("should be true for different number", () => {
    assert.equal(isDifferent(1, 2), true);
  });
  it("should be false for same string", () => {
    assert.equal(isDifferent("a", "a"), false);
  });
  it("should be true for different string", () => {
    assert.equal(isDifferent("a", "b"), true);
  });
  it("should be false for undefined / undefined", () => {
    assert.equal(isDifferent(undefined, undefined), false);
  });
  it("should be true for undefined / null", () => {
    assert.equal(isDifferent(undefined, null), true);
  });
  it("should be false for same array", () => {
    assert.equal(isDifferent([1, 2], [1, 2]), false);
  });
  it("should be true for different array", () => {
    assert.equal(isDifferent([1, 1], [1, 2]), true);
  });
  it("should be false for same object", () => {
    assert.equal(isDifferent({ a: 1 }, { a: 1 }), false);
  });
  it("should be true for different object", () => {
    assert.equal(isDifferent({ a: 1 }, { a: 2 }), true);
  });
});
