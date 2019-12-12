"use strict";

var visit = require("unist-util-visit");

var _ = require("lodash");

var unified = require("unified");

var parse = require("remark-parse");

var shortcodes = require("remark-shortcodes");

module.exports = function (_ref, pluginOptions) {
  var markdownAST = _ref.markdownAST;
  visit(markdownAST, "paragraph", function (node) {
    var shortcode = node.children[0];

    if (shortcode.type === "text" && !!shortcode.value.match(/{{< Video /)) {
      var tree = unified().use(parse) // Plugin inserted below, with custom options for start/end blocks.
      .use(shortcodes, {
        startBlock: "{{<",
        endBlock: ">}}"
      }) // Turn off position output for legibility below.
      .data("settings", {
        position: false
      }).parse(shortcode.value);
      var x = tree.children[0].attributes;
      var url = x.url ? _.escape(x.url) : "";
      var control = x.control;
      var loop = x.loop;
      var autoplay = x.autoplay;
      var muted = x.muted;
      var height = x.height;
      var width = x.width;
      var poster = x.poster ? _.escape(x.poster) : "";
      var html = ("\n      <div style=\"position: relative; margin-left: auto; margin-right: auto;\">\n <video " + (control === "true" ? "controls" : "") + " " + (loop === "true" ? "loop" : "") + "\n " + (autoplay === "true" && muted === "true" ? "autoplay" : "") + " allowfullscreen=true\n " + (muted === "true" ? "muted=true" : "") + " height=" + height + " width=" + width + "  poster=" + poster + ">\n <source src=" + url + " type=\"video/mp4\" />\n <source src=" + url + " type=\"video/ogg\" />\n <source src=" + url + " type=\"video/webm\" />\n       </video>\n </div>\n\n    ").trim();
      node.type = "html";
      node.children = undefined;
      node.value = html;
    }
  });
  return markdownAST;
};