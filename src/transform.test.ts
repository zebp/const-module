import { describe, it, expect } from "vitest";
import { transform } from "./transform.js";

describe("transform", () => {
  it("should transform the input to JS", async () => {
    const output = await transform("export const foo: string = 1;");
    expect(output).toMatchInlineSnapshot(`
      "var o=1;export{o as foo};
      "
    `);
  });
});
