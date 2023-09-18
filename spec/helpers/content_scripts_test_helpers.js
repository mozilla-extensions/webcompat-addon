/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Asserts the expected parameters are passed to
// scripting.registerContentScripts calls.
function assertScriptingAPISpyCalls(spy) {
  expect(spy).toHaveBeenCalled();
  for (const spyCall of spy.calls.all()) {
    expect(spyCall.args).toHaveSize(1);
    const arg = spyCall.args[0];
    expect(arg).toBeInstanceOf(Array);
    expect(arg).toHaveSize(1);
    expect(arg[0]).toBeInstanceOf(Object);
    expect(arg[0].id).toBeInstanceOf(String);
    expect(arg[0].id).not.toHaveSize(0);
    expect(arg[0].persistAcrossSessions).toBe(false);
    expect(arg[0].matches).toBeInstanceOf(Array);
    expect(arg[0].matches).not.toHaveSize(0);
    arg[0].matches.forEach(match => {
      expect(match).toBeInstanceOf(String);
    });
    // At least one of js or css is expected to be
    // a non empty array.
    expect(arg[0].js || arg[0].css).toBeInstanceOf(Array);
    expect(arg[0].js?.length || arg[0].css?.length).not.toBe(0);
    // Verify css and js array elements are all non empty strings.
    if (Array.isArray(arg[0].js)) {
      arg[0].js.forEach(js => {
        expect(js).toBeInstanceOf(String);
        expect(js).not.toHaveSize(0);
      });
    }
    if (Array.isArray(arg[0].css)) {
      arg[0].css.forEach(css => {
        expect(css).toBeInstanceOf(String);
        expect(css).not.toHaveSize(0);
      });
    }
  }
}

// Asserts the expected parameters are passed to
// contentScripts.register calls.
function assertContentScriptsAPISpyCalls(spy) {
  expect(spy).toHaveBeenCalled();
  for (const spyCall of spy.calls.all()) {
    expect(spyCall.args).toHaveSize(1);
    const arg = spyCall.args[0];
    expect(arg).toBeInstanceOf(Object);
    expect(arg.id).not.toBeDefined();
    expect(arg.matches).not.toHaveSize(0);
    arg.matches.forEach(match => {
      expect(match).toBeInstanceOf(String);
    });
    // At least one of js or css is expected to be
    // a non empty array.
    expect(arg.js || arg.css).toBeInstanceOf(Array);
    expect(arg.js?.length || arg.css?.length).not.toBe(0);
    // Verify css and js array elements are all object with a
    // file property set to a non-empty string.
    if (Array.isArray(arg.js)) {
      arg.js.forEach(js => {
        expect(js).toBeInstanceOf(Object);
        expect(js.file).toBeInstanceOf(String);
        expect(js.file).not.toHaveSize(0);
      });
    }
    if (Array.isArray(arg.css)) {
      arg.css.forEach(css => {
        expect(css).toBeInstanceOf(Object);
        expect(css.file).toBeInstanceOf(String);
        expect(css.file).not.toHaveSize(0);
      });
    }
  }
}

module.exports = {
  assertScriptingAPISpyCalls,
  assertContentScriptsAPISpyCalls,
};
