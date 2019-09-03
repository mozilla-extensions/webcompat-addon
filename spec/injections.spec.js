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
      js: [{ file: "test.js" }],
    },
  };
}

function buildPDK5injection() {
  return {
    id: "test",
    platform: "all",
    domain: "Sites using PDK 5 video",
    bug: "0",
    data: {
      urls: ["https://*/*/tpPdk.js", "https://*/*/pdk/js/*/*.js"],
      types: ["script"],
    },
    customFunc: "pdk5fix",
  };
}

function buildDtagFix() {
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
    customFunc: "dtagFix",
  };
}

describe("Injections", () => {
  describe("constructor", () => {
    it("enables injections per default", () => {
      let injections = new Injections([buildInjection("desktop")]);
      expect(injections.isEnabled()).toBe(true);
    });
  });

  describe("contentScript registration", () => {
    it("enables interventions if the plattform matches", async () => {
      let injections = new Injections([buildInjection("desktop")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.contentScripts, "register");

      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled;
    });

    it("does enable universal interventions", async () => {
      let injections = new Injections([buildInjection("all")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.contentScripts, "register");

      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("does not enable interventions if the plattform differs", async () => {
      let injections = new Injections([buildInjection("android")]);
      injections.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.contentScripts, "register");

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
  });

  describe("assignContentScriptDefaults", () => {
    it("assigns runAt=documenet_start if nothing else is specified", () => {
      let injectionConfig = buildInjection("desktop");
      let injections = new Injections([injectionConfig]);

      let finalConfig = injections.assignContentScriptDefaults(
        injectionConfig.contentScripts
      );
      expect(finalConfig.runAt).toBe("document_start");
    });

    it("does not override runAt if specified", () => {
      let injectionConfig = buildInjection("desktop");
      injectionConfig.contentScripts.runAt = "document_idle";

      let injections = new Injections([injectionConfig]);

      let finalConfig = injections.assignContentScriptDefaults(
        injectionConfig.contentScripts
      );
      expect(finalConfig.runAt).toBe("document_idle");
    });
  });

  describe("Custom functions register and unregister", () => {
    it("registers an onBeforeRequest listener for pdk5 injections", async () => {
      let injections = new Injections([buildPDK5injection()], CUSTOM_FUNCTIONS);
      let spy = spyOn(browser.webRequest.onBeforeRequest, "addListener");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("calls pdk5fixDisable when disabling pdk5 fix", async () => {
      const injection = buildPDK5injection();
      injection.active = true;
      let injections = new Injections([injection], CUSTOM_FUNCTIONS);
      let spy = spyOn(CUSTOM_FUNCTIONS, "pdk5fixDisable");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.unregisterContentScripts();
      expect(spy).toHaveBeenCalled();
      expect(injection.active).toBeFalsy();
    });

    it("registers an onHeadersReceived listener for dtag fix", async () => {
      let injections = new Injections([buildDtagFix()], CUSTOM_FUNCTIONS);
      let spy = spyOn(browser.webRequest.onHeadersReceived, "addListener");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("calls dtagFixDisable when disabling dtag fix", async () => {
      const injection = buildDtagFix();
      injection.active = true;
      let injections = new Injections([injection], CUSTOM_FUNCTIONS);
      let spy = spyOn(CUSTOM_FUNCTIONS, "dtagFixDisable");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.unregisterContentScripts();
      expect(spy).toHaveBeenCalled();
      expect(injection.active).toBeFalsy();
    });
  });
});
