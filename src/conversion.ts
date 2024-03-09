type NewType<T extends string, V> = { __const_type: T; value: V };

type DateType = NewType<"Date", string>;
type MapType = NewType<"Map", [unknown, unknown][]>;
type SetType = NewType<"Set", unknown[]>;
type ArrayBufferType = NewType<"ArrayBuffer", number[]>;
type Uint8ArrayType = NewType<"Uint8Array", number[]>;
type PrimitiveArrayType = NewType<"primitive/array", unknown[]>;
type PrimitiveObjectType = NewType<"primitive/object", Record<string, unknown>>;
type PrimitiveType = NewType<"primitive", unknown>;

type Type =
  | DateType
  | MapType
  | SetType
  | ArrayBufferType
  | Uint8ArrayType
  | PrimitiveArrayType
  | PrimitiveObjectType
  | PrimitiveType;

export function deserialize(value: Type): unknown {
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
      const arr: unknown[] = [];

      for (const v of Object.values(value.value)) {
        arr.push(deserialize(v as Type));
      }

      return arr;
    }
    case "primitive/object": {
      const obj: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(value.value)) {
        obj[k] = deserialize(v as Type);
      }

      return obj;
    }
    case "primitive":
      return value.value;
  }
}
