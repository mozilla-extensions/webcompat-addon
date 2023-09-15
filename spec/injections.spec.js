/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const mockBroker = require("./helpers/mock_about_compat_broker");

let Injections = require("../src/lib/injections");
const CUSTOM_FUNCTIONS = require("../src/lib/custom_functions");

function buildInjection(platform) {
  return {
    id: "test",
    platform,
    domain: "example.com",
    bug: "0",
    contentScripts: {
      matches: ["https://example.com/*"],
      js: [
        {
          file: "test.js",
        },
      ],
    },
  };
}

function buildNoSniffFix() {
  return {
    id: "test",
    platform: "desktop",
    domain: "slideshare.net",
    bug: "0",
    data: {
      urls: ["https://*.linkedin.com/tscp-serving/dtag*"],
      contentType: {
        name: "content-type",
        value: "text/html; charset=utf-8",
      },
    },
    customFunc: "noSniffFix",
  };
}

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

describe("Injections", () => {
  describe("constructor", () => {
    it("enables injections per default", () => {
      let injections = new Injections([buildInjection("desktop")]);
      expect(injections.isEnabled()).toBe(true);
    });
  });

  describe("contentScript registration", () => {
    it("enables interventions if the platform matches", async () => {
      let injections = new Injections([buildInjection("desktop")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.scripting, "registerContentScripts");

      await injections.registerContentScripts();
      assertScriptingAPISpyCalls(spy);
    });

    it("does enable universal interventions", async () => {
      let injections = new Injections([buildInjection("all")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.scripting, "registerContentScripts");

      await injections.registerContentScripts();
      assertScriptingAPISpyCalls(spy);
    });

    it("does not enable interventions if the platform differs", async () => {
      let injections = new Injections([buildInjection("android")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.scripting, "registerContentScripts");

      await injections.registerContentScripts();
      expect(spy).not.toHaveBeenCalled();
    });

    it("does inform the broker about changed contentscripts", async () => {
      let injections = new Injections([buildInjection("desktop")]);

      let spy = spyOn(mockBroker.portsToAboutCompatTabs, "broadcast");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("fallbacks to contentScripts API on useScriptingAPI set to false", async () => {
      // Expect Injections to fallback to use contentScripts.register
      // getBoolPrefSync("useScriptingAPI") returns false.
      let spyGetBookPrefSync = spyOn(
        browser.aboutConfigPrefs,
        "getBoolPrefSync"
      ).and.returnValue(false);

      let injections = new Injections([buildInjection("desktop")]);
      expect(spyGetBookPrefSync).toHaveBeenCalledOnceWith("useScriptingAPI");
      injections.bindAboutCompatBroker(mockBroker);
      let spyRegister = spyOn(browser.contentScripts, "register");
      await injections.registerContentScripts();
      assertContentScriptsAPISpyCalls(spyRegister);
    });
  });

  describe("buildContentScriptRegistrations", () => {
    it("assigns runAt=document_start if nothing else is specified", () => {
      let injectionConfig = buildInjection("desktop");
      let injections = new Injections([injectionConfig]);

      let finalConfig = injections.buildContentScriptRegistrations(
        injectionConfig.contentScripts
      );
      expect(finalConfig.runAt).toBe("document_start");
    });

    it("does not override runAt if specified", () => {
      let injectionConfig = buildInjection("desktop");
      injectionConfig.contentScripts.runAt = "document_idle";

      let injections = new Injections([injectionConfig]);

      let finalConfig = injections.buildContentScriptRegistrations(
        injectionConfig.contentScripts
      );
      expect(finalConfig.runAt).toBe("document_idle");
    });
  });

  describe("Custom functions register and unregister", () => {
    it("registers an onHeadersReceived listener for no sniff fix", async () => {
      let injections = new Injections([buildNoSniffFix()], CUSTOM_FUNCTIONS);
      let spy = spyOn(browser.webRequest.onHeadersReceived, "addListener");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("calls noSniffFixDisable when disabling the fix", async () => {
      const injection = buildNoSniffFix();
      injection.active = true;
      let injections = new Injections([injection], CUSTOM_FUNCTIONS);
      let spy = spyOn(CUSTOM_FUNCTIONS, "noSniffFixDisable");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.unregisterContentScripts();
      expect(spy).toHaveBeenCalled();
      expect(injection.active).toBeFalsy();
    });
  });
});
