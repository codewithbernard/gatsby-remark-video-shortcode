"use strict";

var visit = require("unist-util-visit");

var _ = require("lodash");

var unified = require("unified");

var parse = require("remark-parse");

var shortcodes = require("remark-shortcodes");

var extractString = function extractString(str) {
  return str.substring(1, str.length - 1);
};

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
      var url = extractString(x.url ? _.escape(x.url) : "");
      var control = extractString(x.control);
      var loop = extractString(x.loop);
      var autoplay = extractString(x.autoplay);
      var muted = extractString(x.muted);
      var height = extractString(x.height);
      var width = extractString(x.width);
      var poster = extractString(x.poster ? _.escape(x.poster) : "");
      var html = ("\n      <div style=\"position: relative; margin-left: auto; margin-right: auto;\">\n <video " + (control && "controls=" + control) + " loop=" + loop + "\n " + (autoplay && muted && "autoplay=" + autoplay) + " allowfullscreen=true\n " + (muted && "muted=" + muted) + " height=" + height + " width=" + width + "  poster=" + poster + ">\n         <source src=" + url + " type=\"video/mp4\" />\n         <source src=" + url + " type=\"video/ogg\" />\n         <source src=" + url + " type=\"video/webm\" />\n       </video>\n </div>\n\n    ").trim();
      node.type = "html";
      node.children = undefined;
      node.value = html;
    }
  });
  return markdownAST;
};