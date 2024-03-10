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
export async function asConst(path: string): Promise<string> {
  return await evaluateToConst(path);
}
