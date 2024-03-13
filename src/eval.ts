import * as childProcess from "node:child_process";
import * as url from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { deserialize } from "./conversion.js";

function js(name: string) {
  try {
    // @ts-ignore
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    const entryJs = path.resolve(__dirname, name);
    if (fs.existsSync(entryJs)) {
      return entryJs;
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return path.resolve(__dirname, name);
    }
  } catch (_) {
    return `node_modules/const-module/dist/${name}`;
  }
}

export async function evaluate(path: string): Promise<string> {
  const child = childProcess.exec(
    `node ${js("tsx-cli.js")} ${js("entry.js")} ${path}`,
    {
      maxBuffer: 1024 * 1024 * 1024,
    },
  );

  let stdout = "";
  let stderr = "";

  child.stdout?.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr?.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const output = await new Promise<string>((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", async (code: number) => {
      if (code === 0) {
        resolve(stdout);
      } else if (stderr.length > 0) {
        reject(new Error(stderr));
      } else {
        reject("No output from const runner.");
      }
    });
  });

  // let's make the output pretty
  return JSON.stringify(JSON.parse(output), null, 2);
}

export async function evaluateToConst(codePath: string): Promise<string> {
  const exports = await evaluate(codePath);
  const deserialized = deserialize(JSON.parse(exports)) as Record<
    string,
    unknown
  >;
  let output = `${deserialize.toString()}\nconst __module = deserialize(${exports});\n`;

  for (const key of Object.keys(deserialized)) {
    if (key === "default") {
      output += "export default __module.default;\n";
    } else {
      output += `export const ${key} = __module.${key};\n`;
    }
  }

  return output;
}
