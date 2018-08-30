"use strict";

const WEBKIT_SCROLLBAR = "::-webkit-scrollbar";

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
  // TODO sheet.media?

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
        // TODO support other style?
        if (rule.style.display == "none") {
          // TODO don't break inside parens.
          let selectors = rule.selectorText.split(",");
          for (let selector of selectors) {
            selector = selector.trim();
            if (selector.endsWith(WEBKIT_SCROLLBAR)) {
              // TODO if the result selector ends with a combinator,
              // a universal selectors should be added.
              selector = selector.slice(0, -WEBKIT_SCROLLBAR.length);
              yield selector;
            }
          }
        }
      }
      // TODO @media / @support?
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
