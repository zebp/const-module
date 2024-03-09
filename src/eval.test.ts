import { describe, expect } from "vitest";
import { evaluate as evalRaw, evaluateToConst } from "./eval.js";
import { deserialize } from "./conversion.js";

import { newTmpFile, tmpdirTest } from "../test/util.js";

const evaluate = async (path: string) => {
  const output = await evalRaw(path);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return deserialize(JSON.parse(output) as any) as Record<string, unknown>;
};

describe("eval", () => {
  tmpdirTest("should give basic exports from a module", async ({ tmpdir }) => {
    const filename = await newTmpFile(tmpdir, "export const foo = 1;");
    const output = await evaluate(filename);
    expect(output).toEqual({ foo: 1 });
  });

  describe("complex types", () => {
    tmpdirTest("should serialize dates", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = new Date(2023, 0, 0);",
      );
      const output = await evaluate(filename);
      expect(output).toEqual({ foo: new Date(2023, 0, 0) });
    });

    tmpdirTest("should serialize maps", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = new Map([['a', 1], ['b', 2]]);",
      );
      const output = await evaluate(filename);
      expect(output).toEqual({
        foo: new Map([
          ["a", 1],
          ["b", 2],
        ]),
      });
    });

    tmpdirTest("should serialize sets", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = new Set([1, 2, 3]);",
      );
      const output = await evaluate(filename);
      expect(output).toEqual({ foo: new Set([1, 2, 3]) });
    });

    tmpdirTest("should serialize ArrayBuffers", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = new Uint8Array([1, 2, 3]).buffer;",
      );
      const output = await evaluate(filename);
      expect(output).toHaveProperty("foo");
      expect(output.foo).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(output.foo as ArrayBuffer)).toEqual(
        new Uint8Array([1, 2, 3]),
      );
    });

    tmpdirTest("should serialize Uint8Arrays", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = new Uint8Array([1, 2, 3]);",
      );
      const output = await evaluate(filename);
      expect(output).toEqual({ foo: new Uint8Array([1, 2, 3]) });
    });

    tmpdirTest("should serialize objects", async ({ tmpdir }) => {
      const filename = await newTmpFile(
        tmpdir,
        "export const foo = { bar: 1 };",
      );
      const output = await evaluate(filename);
      expect(output).toEqual({ foo: { bar: 1 } });
    });

    tmpdirTest(
      "should serialize objects with complex types",
      async ({ tmpdir }) => {
        const filename = await newTmpFile(
          tmpdir,
          "export const foo = { bar: new Date(2023, 0, 0) };",
        );
        const output = await evaluate(filename);
        expect(output).toEqual({ foo: { bar: new Date(2023, 0, 0) } });
      },
    );
  });
});

describe("evaluateToConst", () => {
  tmpdirTest("should create a module object at the top", async ({ tmpdir }) => {
    const filename = await newTmpFile(
      tmpdir,
      `
    export default 2;
    export const foo = 1;
    `,
    );
    const output = await evaluateToConst(filename);
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
			    "default": {
			      "__const_type": "primitive",
			      "value": 2
			    },
			    "foo": {
			      "__const_type": "primitive",
			      "value": 1
			    }
			  }
			});
			export default __module.default;
			export const foo = __module.foo;
			"
		`);
  });
});
