import { isEdge, isNode } from "../src";

describe("isNode type-guard should return", function () {
  test("true for valid node", () => {
    expect(
      isNode({
        id: "1-1",
        label: "Node",
        status: "ok",
      })
    ).toEqual(true);
  });
  test("false for invalid node", () => {
    expect(
      isNode({
        id: 11,
        from: "1-1",
        to: "1-2",
      })
    ).toEqual(false);
  });
});

describe("isEdge type-guard should return", function () {
  test("true for valid edge", () => {
    expect(
      isEdge({
        id: "1-1-1-2",
        from: "1-1",
        to: "1-2",
      })
    ).toEqual(true);
  });
  test("false for invalid edge", () => {
    expect(
      isEdge({
        id: 11,
        from: "1-1",
        to: "1-2",
      })
    ).toEqual(false);
  });
});
