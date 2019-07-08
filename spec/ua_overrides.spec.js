/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const mockBroker = require("./helpers/mock_about_compat_broker");

let UAOverrides = require("../src/lib/ua_overrides");

function buildOverride(platform) {
  return {
    id: "test",
    platform,
    domain: "example.com",
    bug: "0",
    config: {
      matches: ["*://example.com/*"],
      uaTransformer: (originalUA) => {
        return originalUA + " TestingFirefox";
      },
    },
  };
}

describe("UAOverrides", () => {
  describe("constructor", () => {
    it("enables UA Overrides per default", () => {
      let uaOverrides = new UAOverrides([buildOverride("desktop")]);
      expect(uaOverrides.isEnabled()).toBe(true);
    });
  });

  describe("contentScript registration", () => {
    it("enables overrides if the plattform matches", async () => {
      let uaOverrides = new UAOverrides([buildOverride("desktop")]);
      uaOverrides.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.webRequest.onBeforeSendHeaders, "addListener");

      await uaOverrides.registerUAOverrides();
      expect(spy).toHaveBeenCalled;
    });

    it("does enable universal overrides", async () => {
      let uaOverrides = new UAOverrides([buildOverride("all")]);
      uaOverrides.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.webRequest.onBeforeSendHeaders, "addListener");

      await uaOverrides.registerUAOverrides();
      expect(spy).toHaveBeenCalled();
    });

    it("does not enable override if the plattform differs", async () => {
      let uaOverrides = new UAOverrides([buildOverride("android")]);
      uaOverrides.bindAboutCompatBroker(mockBroker);

      let spy = spyOn(browser.webRequest.onBeforeSendHeaders, "addListener");

      await uaOverrides.registerUAOverrides();
      expect(spy).not.toHaveBeenCalled();
    });

    it("does inform the broker about changed overrides", async () => {
      let uaOverrides = new UAOverrides([buildOverride("desktop")]);

      let spy = spyOn(mockBroker.portsToAboutCompatTabs, "broadcast");

      uaOverrides.bindAboutCompatBroker(mockBroker);
      await uaOverrides.registerUAOverrides();
      expect(spy).toHaveBeenCalled();
    });
  });
});
