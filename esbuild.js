const esbuild = require("esbuild")
esbuild
  .build({
    entryPoints: ["src/code.ts"],
    bundle: true,
    platform: "node",
    target: ["node10.4"],
    outfile: "dist/code.js",
  })
  .catch(() => process.exit(1))
const { readFile, writeFile } = require("fs").promises
const minify = require("html-minifier-terser").minify
// iframe UI

;(async () => {
  const script = esbuild.buildSync({
    entryPoints: ["src/ui.ts"],
    bundle: true,
    minify: true,
    write: false,
    target: ["chrome58", "firefox57", "safari11", "edge18"],
  })
  const css = esbuild.buildSync({
    entryPoints: ["src/style.css"],
    bundle: true,
    minify: true,
    write: false,
    target: ["chrome58", "firefox57", "safari11", "edge18"],
  })

  const html = await readFile("src/ui.html", "utf8")
  // const css = await readFile('src/style.css', 'utf8');

  const minifyOptions = {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
  }

  await writeFile(
    "dist/ui.html",
    `<style>${await minify(css.outputFiles[0].text, minifyOptions)}</style>${await minify(
      html,
      minifyOptions,
    )}
    <script>${script.outputFiles[0].text}</script>`,
  )
})()
