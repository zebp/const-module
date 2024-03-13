// Depending on the package manager node_modules/.bin/tsx might not exist, nor node_modules/tsx!
// So we'll instead write our own wrapper that just imports the CLI to ensure we can use this with
// pnpm and yarn.
import "tsx/cli";
