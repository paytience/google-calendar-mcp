import { build } from "esbuild";

const shebangPlugin = {
  name: "shebang",
  setup(build) {
    build.onLoad({ filter: /src\/index\.ts$/ }, async (args) => {
      const { readFile } = await import("fs/promises");
      let contents = await readFile(args.path, "utf8");
      contents = contents.replace(/^#!.*\n/, "");
      return { contents, loader: "ts" };
    });
  },
};

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: "dist/index.js",
  banner: { js: "#!/usr/bin/env node" },
  plugins: [shebangPlugin],
});
