const esbuild = require("esbuild")
const { readFile, writeFile } = require("fs").promises
const minify = require("html-minifier-terser").minify
//building and resolving all main code and putting it in the code.js in dist
esbuild.build({
    entryPoints: ["src/code.ts"],
    bundle: true,
    platform: "node",
    target: ["node10.4"],
    outfile: "dist/code.js",
  })
  .catch(() => process.exit(1));
  
  (async () => {
  //building and resolving all code for the ui
  const script = esbuild.buildSync({
    entryPoints: ["src/ui.ts"],
    bundle: true,
    minify: true,
    write: false,
    target: ["chrome58", "firefox57", "safari11", "edge18"],
  })

  //building and resolving all css
  const css = esbuild.buildSync({
    entryPoints: ["src/style.css"],
    bundle: true,
    minify: true,
    write: false,
    target: ["chrome58", "firefox57", "safari11", "edge18"],
  })

  //reading the html file where the css and ui code should be injected
  const html = await readFile("src/ui.html", "utf8")

  //minifying options (see: https://www.npmjs.com/package/html-minifier-terser)
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

  //injection logic into the html file for the ui.ts-code and the css
  await writeFile(
    "dist/ui.html",
    `<style>${await minify(css.outputFiles[0].text, minifyOptions)}</style>${await minify(
      html,
      minifyOptions,
    )}
    <script>${script.outputFiles[0].text}</script>`,
  )
})()
