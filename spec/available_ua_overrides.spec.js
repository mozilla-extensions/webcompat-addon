/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const WebExtManifestSchmea = require("./helpers/webext_manifest_schema");

const AVAILABLE_UA_OVERRIDES = require("../src/data/ua_overrides");
const TEST_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0";

describe("AVAILABLE_UA_OVERRIDES", () => {
  it("contains at least one UA override definition", () => {
    expect(AVAILABLE_UA_OVERRIDES.length).toBeGreaterThanOrEqual(1);
  });
});

for (const override of AVAILABLE_UA_OVERRIDES) {
  describe(`override #${override.id}`, () => {
    it("provides an ID", () => {
      expect(override.id).toBeTruthy();
    });

    it("provides a valid platform", () => {
      expect(
        ["all", "desktop", "android", "mac", "win", "linux"].includes(
          override.platform
        )
      ).toBeTruthy();
    });

    it("provides a domain", () => {
      expect(override.domain).toBeTruthy();
    });

    it("provides a bug ID", () => {
      expect(override.bug).toBeTruthy();
    });

    it("provides valid URLs", () => {
      expect(
        WebExtManifestSchmea.matchPatternsValid(override.config.matches)
      ).toBeTruthy();
    });

    it("provides an uaTransformer that does return a string", () => {
      expect(override.config.uaTransformer(TEST_UA)).toEqual(
        jasmine.any(String)
      );
    });
  });
}
