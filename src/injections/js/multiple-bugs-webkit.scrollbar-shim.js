"use strict";

/**
 * Bug XXX - Shim -webkit-scrollbar
 * WebCompat issue #12356 - https://webcompat.com/issues/12356
 */

/**
 * This intervention attempts to shim -webkit-scrollbar on site's that are
 * broken in some way or another, because they depend on specific scrollbar
 * layouts.
 *
 * This is not a complete solution for all possible scrollbar stylings. At the
 * moment, this shim supports:
 *
 *  * Setting `scrollbar-width: none;` if the webkit scrollbar has
 *    `display: none` set.
 *
 * Things that should be implemented at some point:
 *
 *  * Support for scrollbar styles in @media/@support queries
 *  * Support for a stylesheets media attribute
 *  * Support for more complex selectors, including combinators
 *  * Other style attributes for -webkit-scrollbar
 *
 * Using this approach has some caveats:
 *
 *  * This intervention is looping over all CSS rules on a given page, so the
 *    performance impact may be significant. Although the parsing itself is run
 *    inside an async function, long runtimes can cause visual flickerin when
 *    scrollbar styles are changed.
 */

const WEBKIT_SCROLLBAR_SELECTOR = "::-webkit-scrollbar";

let docForParsing;
function parseStylesheet(content) {
  if (!docForParsing) {
    docForParsing = document.implementation.createHTMLDocument();
  }
  let style = docForParsing.createElement("style");
  style.textContent = content;
  docForParsing.head.appendChild(style);
  let sheet = style.sheet;
  style.remove();
  return sheet;
}

async function scrollbarSelectors(sheet) {
  if (sheet.disabled) {
    return;
  }

  let rules;
  try {
    rules = sheet.cssRules;
  } catch (e) {
    let resp = await fetch(sheet.href);
    let content = await resp.text();
    let newSheet = parseStylesheet(content);
    rules = newSheet.cssRules;
  }

  return function*() {
    for (let rule of rules) {
      if (rule.type == CSSRule.STYLE_RULE) {
        if (rule.style.display == "none") {
          // TODO don't break inside parens.
          let selectors = rule.selectorText.split(",");
          for (let selector of selectors) {
            selector = selector.trim();
            if (selector.endsWith(WEBKIT_SCROLLBAR_SELECTOR)) {
              selector = selector.slice(0, -WEBKIT_SCROLLBAR_SELECTOR.length);
              yield selector;
            }
          }
        }
      }
    }
  }();
}

async function run() {
  let sheets = [];
  for (let sheet of document.styleSheets) {
    sheets.push(scrollbarSelectors(sheet));
  }
  let selectors = [];
  for (let sheet of sheets) {
    let rules = await sheet;
    selectors.push(...rules);
  }

  let style = document.createElement("style");
  style.textContent = selectors.join(", ") + " { scrollbar-width: none; }";
  document.head.appendChild(style);
}

run();
