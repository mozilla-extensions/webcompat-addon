/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const mockBroker = require("./helpers/mock_about_compat_broker");

let Injections = require("../src/lib/injections");

function buildInjection(platform) {
  return {
    id: "test",
    platform,
    domain: "example.com",
    bug: "0",
    contentScripts: {
      matches: ["https://example.com/*"],
      js: [{file: "test.js"}],
      runAt: "document_start",
    },
  };
}

function buildPDK5injection() {
  return {
    id: "test",
    platform: "all",
    domain: "Sites using PDK 5 video",
    bug: "0",
    pdk5fix: {
      urls: ["https://*/*/tpPdk.js", "https://*/*/pdk/js/*/*.js"],
      types: ["script"],
    },
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

    it("registers an onBeforeRequest listener for pdk5 injections", async () => {
      let injections = new Injections([buildPDK5injection()]);

      let spy = spyOn(browser.webRequest.onBeforeRequest, "addListener");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });

    it("does inform the broker about changed contentscripts", async () => {
      let injections = new Injections([buildInjection("desktop")]);

      let spy = spyOn(mockBroker.portsToAboutCompatTabs, "broadcast");

      injections.bindAboutCompatBroker(mockBroker);
      await injections.registerContentScripts();
      expect(spy).toHaveBeenCalled();
    });
  });
});
