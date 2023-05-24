import { idGenerator } from "../src";

describe("idGenerator should generate correct id", function () {
  test("which is string", () => {
    expect(typeof idGenerator()).toEqual("string");
  });
  test("which is 36 characters long", () => {
    expect(idGenerator().length).toEqual(36);
  });
});
