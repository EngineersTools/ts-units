
import { build, emptyDir } from "dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/index.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  importMap: "deno.json",
  package: {
    // package.json properties
    name: "@eng-tools/ts-units",
    version: "0.1.1",
    description: "A type-safe unit conversion library for TypeScript",
    license: "AGPL-3.0",
    repository: {
      type: "git",
      url: "git+https://github.com/EngineersTools/ts-units.git",
    },
    bugs: {
      url: "https://github.com/EngineersTools/ts-units/issues",
    },
    private: false,
    type: "module",
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE.md", "npm/LICENSE.md");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
