import { test } from "vitest";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as path from "node:path";

interface TmpDirFixture {
  tmpdir: string;
}

async function createTempDir() {
  const ostmpdir = os.tmpdir();
  const tmpdir = path.join(ostmpdir, "unit-test-");
  return await fs.mkdtemp(tmpdir);
}

export const tmpdirTest = test.extend<TmpDirFixture>({
  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  tmpdir: async ({}, use) => {
    const directory = await createTempDir();

    await use(directory);

    await fs.rm(directory, { recursive: true });
  },
});

export async function newTmpFile(tmpdir: string, content: string) {
  const filename = path.join(tmpdir, "file.mjs");
  await fs.writeFile(filename, content);
  return filename;
}
