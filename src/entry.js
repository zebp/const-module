// @ts-check

// This file is the entry point for the const evaluation process.
// It is responsible for importing the const module and evaluating it and then dumping the result to stdout.
import * as path from "node:path";

async function main() {
  try {
    const [_node, _entry, modulePath] = process.argv;

    if (!modulePath) throw new Error("No module path provided.");

    const absoluteModulePath = path.resolve(modulePath);
    const mod = await import(absoluteModulePath);

    const convertedModule = convertToSerializableTypes({ ...mod });
    const serializedModule = JSON.stringify(convertedModule);
    console.log(serializedModule);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// @ts-ignore
function convertToSerializableTypes(value) {
  if (value instanceof Date) {
    return {
      __const_type: "Date",
      value: value.toISOString(),
    };
  }

  if (value instanceof Map) {
    return {
      __const_type: "Map",
      value: Array.from(value.entries()),
    };
  }

  if (value instanceof Set) {
    return {
      __const_type: "Set",
      value: Array.from(value.values()),
    };
  }

  if (value instanceof ArrayBuffer) {
    return {
      __const_type: "ArrayBuffer",
      value: Array.from(new Uint8Array(value)),
    };
  }

  if (value instanceof Uint8Array) {
    return {
      __const_type: "Uint8Array",
      value: Array.from(value),
    };
  }

  if (typeof value === "function") {
    throw new Error("Functions cannot be serialized in const modules.");
  }

  if (Array.isArray(value)) {
    return {
      __const_type: "primitive/array",
      value: value.map(convertToSerializableTypes),
    };
  }

  if (value instanceof Object) {
    const serializedObject = {};

    for (const key in value) {
      // @ts-ignore
      serializedObject[key] = convertToSerializableTypes(value[key]);
    }

    return {
      __const_type: "primitive/object",
      value: serializedObject,
    };
  }

  return {
    __const_type: "primitive",
    value,
  };
}

main();
