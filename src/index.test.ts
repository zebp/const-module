import { describe, it, expect } from "vitest";
import { asConst } from "./index.js";

describe("asConst", () => {
  it("should constify JS without the transform option", async () => {
    const output = await asConst("export const foo = 1;", { transform: false });
    expect(output).toMatchInlineSnapshot(`
			"function deserialize(value) {
			  switch (value.__const_type) {
			    case "Date":
			      return new Date(value.value);
			    case "Map":
			      return new Map(value.value);
			    case "Set":
			      return new Set(value.value);
			    case "ArrayBuffer":
			      return new Uint8Array(value.value).buffer;
			    case "Uint8Array":
			      return new Uint8Array(value.value);
			    case "primitive/array": {
			      const arr = [];
			      for (const v of Object.values(value.value)) {
			        arr.push(deserialize(v));
			      }
			      return arr;
			    }
			    case "primitive/object": {
			      const obj = {};
			      for (const [k, v] of Object.entries(value.value)) {
			        obj[k] = deserialize(v);
			      }
			      return obj;
			    }
			    case "primitive":
			      return value.value;
			  }
			}
			const __module = deserialize({
			  "__const_type": "primitive/object",
			  "value": {
			    "foo": {
			      "__const_type": "primitive",
			      "value": 1
			    }
			  }
			});
			export const foo = __module.foo;
			"
		`);
  });

  it("should constify TS with the transform option", async () => {
    const output = await asConst("export const foo: number = 1 as number;", {
      transform: true,
    });

    expect(output).toMatchInlineSnapshot(`
			"function deserialize(value) {
			  switch (value.__const_type) {
			    case "Date":
			      return new Date(value.value);
			    case "Map":
			      return new Map(value.value);
			    case "Set":
			      return new Set(value.value);
			    case "ArrayBuffer":
			      return new Uint8Array(value.value).buffer;
			    case "Uint8Array":
			      return new Uint8Array(value.value);
			    case "primitive/array": {
			      const arr = [];
			      for (const v of Object.values(value.value)) {
			        arr.push(deserialize(v));
			      }
			      return arr;
			    }
			    case "primitive/object": {
			      const obj = {};
			      for (const [k, v] of Object.entries(value.value)) {
			        obj[k] = deserialize(v);
			      }
			      return obj;
			    }
			    case "primitive":
			      return value.value;
			  }
			}
			const __module = deserialize({
			  "__const_type": "primitive/object",
			  "value": {
			    "foo": {
			      "__const_type": "primitive",
			      "value": 1
			    }
			  }
			});
			export const foo = __module.foo;
			"
		`);
  });

  describe("errors", () => {
    it("should throw if the input is invalid", async () => {
      await expect(asConst("diahkldgwuiad")).rejects.toThrow();
    });

    it("should throw input is TS without transform", async () => {
      await expect(
        asConst("export const foo: number = 1;", {
          transform: false,
        }),
      ).rejects.toThrow();
    });
  });
});
