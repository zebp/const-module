import * as fs from "node:fs/promises";
import * as esbuild from "esbuild";

export async function transform(contents: string): Promise<string> {
  const randId = Math.random().toString(36).substring(7);
  const input = `/tmp/${randId}-input.ts`;

  try {
    await fs.writeFile(input, contents, "utf-8");

    const results = await esbuild.build({
      bundle: true,
      format: "esm",
      platform: "node",
      entryPoints: [input],
      logLevel: "silent",
      write: false,
      minify: true,
    });

    if (results.errors.length > 0) {
      throw new Error(results.errors[0].text);
    }

    if (!results.outputFiles?.length) {
      throw new Error("No output files");
    }

    return results.outputFiles[0].text;
  } finally {
    await fs.unlink(input);
  }
}
