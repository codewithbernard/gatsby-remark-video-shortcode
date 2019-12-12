const visit = require("unist-util-visit")
const _ = require(`lodash`)
var unified = require("unified")
var parse = require("remark-parse")
var shortcodes = require("remark-shortcodes")

const extractString = str => {
  return str.substring(1, str.length - 1)
}
module.exports = ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, "paragraph", node => {
    let shortcode = node.children[0]

    if (shortcode.type === "text" && !!shortcode.value.match(/{{< Video /)) {
      var tree = unified()
        .use(parse)
        // Plugin inserted below, with custom options for start/end blocks.
        .use(shortcodes, {
          startBlock: "{{<",
          endBlock: ">}}",
        })
        // Turn off position output for legibility below.
        .data("settings", { position: false })
        .parse(shortcode.value)
      let x = tree.children[0].attributes
      const url = extractString(x.url ? _.escape(x.url) : "")
      const control = extractString(x.control)
      const loop = extractString(x.loop)
      const autoplay = extractString(x.autoplay)
      const muted = extractString(x.muted)
      const height = extractString(x.height)
      const width = extractString(x.width)
      const poster = extractString(x.poster ? _.escape(x.poster) : "")

      const html = `
      <div style=\"position: relative; margin-left: auto; margin-right: auto;\">\n <video ${control &&
        `controls=${control}`} loop=${loop}\n ${autoplay &&
        muted &&
        `autoplay=${autoplay}`} allowfullscreen=true\n ${muted &&
        `muted=${muted}`} height=${height} width=${width}  poster=${poster}>\n         <source src=${url} type=\"video/mp4\" />\n         <source src=${url} type=\"video/ogg\" />\n         <source src=${url} type=\"video/webm\" />\n       </video>\n </div>\n
    `.trim()
      node.type = "html"
      node.children = undefined
      node.value = html
    }
  })
  return markdownAST
}
