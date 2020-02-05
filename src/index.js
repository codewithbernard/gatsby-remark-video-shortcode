const visit = require("unist-util-visit");
const _ = require(`lodash`);
var unified = require("unified");
var parse = require("remark-parse");
var shortcodes = require("remark-shortcodes");

module.exports = ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, "paragraph", node => {
    let shortcode = node.children[0];

    if (shortcode.type === "text" && !!shortcode.value.match(/{{< Video /)) {
      var tree = unified()
        .use(parse)
        // Plugin inserted below, with custom options for start/end blocks.
        .use(shortcodes, {
          startBlock: "{{<",
          endBlock: ">}}"
        })
        // Turn off position output for legibility below.
        .data("settings", { position: false })
        .parse(shortcode.value);
      let x = tree.children[0].attributes;
      const url = x.url ? _.escape(x.url) : "";
      const control = x.control;
      const loop = x.loop;
      const autoplay = x.autoplay;
      const muted = x.muted;
      const height = x.height;
      const width = x.width;
      const poster = x.poster ? _.escape(x.poster) : "";

      const html = `
      <div style=\"position: relative; margin-left: auto; margin-right: auto; max-width:${width}\">\n <video ${
        control === "true" ? "controls" : ""
      } ${loop === "true" ? "loop" : ""}\n ${
        autoplay === "true" && muted === "true" ? "autoplay" : ""
      } allowfullscreen=true\n ${
        muted === "true" ? "muted=true" : ""
      } height=${height} poster=${poster} style=\"width:100%;left:0;top:0;\">\n <source src=${url} type=\"video/mp4\" />\n <source src=${url} type=\"video/ogg\" />\n <source src=${url} type=\"video/webm\" />\n       </video>\n </div>\n
    `.trim();
      node.type = "html";
      node.children = undefined;
      node.value = html;
    }
  });
  return markdownAST;
};
