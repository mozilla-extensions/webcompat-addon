/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {
  assertScriptingAPISpyCalls,
  assertContentScriptsAPISpyCalls,
} = require("./helpers/content_scripts_test_helpers.js");

let Shims = require("../src/lib/shims");

function buildTestShimWithContentScripts(platform) {
  return {
    id: "TestShim",
    platform,
    name: "TestShimName",
    bug: "0",
    contentScripts: [
      {
        js: "script_document_start.js",
        matches: ["https://example.com/*"],
        runAt: "document_start",
        allFrames: true,
      },
      {
        js: "script_document_end.js",
        matches: ["https://example.com/*"],
        runAt: "document_end",
      },
    ],
  };
}

// Mock the onMessageFromTab defined from messaging_helper.js.
jasmine.getGlobal().onMessageFromTab = () => {};

// Mock for the getPref calls originated by the Shims.
async function mockGetPref(prefName) {
  expect(["disabled_shims.TestShim", "enable_shims"]).toContain(prefName);
  switch (prefName) {
    case "disabled_shims.TestShim":
      return false;
    case "enable_shims":
      return true;
  }
  return undefined;
}

async function testShimsContentScriptsRegistering() {
  let spyGetPref = spyOn(browser.aboutConfigPrefs, "getPref");
  spyGetPref.and.callFake(mockGetPref);

  let shims = new Shims([buildTestShimWithContentScripts("all")]);
  expect(spyGetPref).toHaveBeenCalledWith("enable_shims");
  expect(spyGetPref).toHaveBeenCalledWith("disabled_shims.TestShim");
  // Wait one tick so that shims will be able to
  // update its enabled state based on the
  // getPref call.
  await Promise.resolve();
  expect(shims.enabled).toBe(true);

  // Retrieve the registered shim and assert
  // the properties expected to be passed
  // to the scripting API.
  expect(shims.shims.size).toBe(1);
  expect(shims.shims.has("TestShim")).toBe(true);
  const testShim = shims.shims.get("TestShim");
  expect(testShim.enabled).toBe(true);
  await testShim.ready;
}

describe("Shims", () => {
  describe("content scripts registration", () => {
    it("registers enabled Shims content scripts", async () => {
      let spyRegister = spyOn(browser.scripting, "registerContentScripts");
      await testShimsContentScriptsRegistering();
      assertScriptingAPISpyCalls(spyRegister);
    });

    it("fallbacks to contentScripts API on useScriptingAPI set to false", async () => {
      // Expect Injections to fallback to use contentScripts.register
      // getBoolPrefSync("useScriptingAPI") returns false.
      let spyGetBookPrefSync = spyOn(
        browser.aboutConfigPrefs,
        "getBoolPrefSync"
      ).and.returnValue(false);

      let spyRegister = spyOn(browser.contentScripts, "register");
      await testShimsContentScriptsRegistering();
      expect(spyGetBookPrefSync).toHaveBeenCalledOnceWith("useScriptingAPI");

      assertContentScriptsAPISpyCalls(spyRegister);
    });
  });
});
