import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { transform } from "./transform.js";
import { evaluateToConst } from "./eval.js";

export type EvaluationOptions = {
  /**
   * If the `transform` option is set to `true`, the contents of the input will be transformed to JS via esbuild.
   */
  transform?: boolean;
};

/**
 * @param input The module to evaluate.
 * @param options
 * @returns {Promise<string>} The module with constant exports.
 */
export async function asConst(
  input: string,
  options: EvaluationOptions = {},
): Promise<string> {
  const src = options.transform ? await transform(input) : input;

  const ostmpdir = os.tmpdir();
  const tmpdir = path.join(ostmpdir, "const-module-");
  const tmp = await fs.mkdtemp(tmpdir);
  const filename = path.join(tmp, "file.mjs");

  await fs.writeFile(filename, src, "utf-8");

  return await evaluateToConst(filename);
}
