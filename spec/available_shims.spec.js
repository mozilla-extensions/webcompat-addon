/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const WebExtManifestSchmea = require("./helpers/webext_manifest_schema");

const AVAILABLE_SHIMS = require("../src/data/shims.js");

describe("AVAILABLE_SHIMS", () => {
  it("contains at least one Shim definition", () => {
    expect(AVAILABLE_SHIMS.length).toBeGreaterThanOrEqual(1);
  });
});

for (const shim of AVAILABLE_SHIMS) {
  describe(`shim #${shim.id}`, () => {
    it("provides an ID", () => {
      expect(shim.id).toBeTruthy();
    });

    it("provides a valid platform", () => {
      expect(
        ["all", "desktop", "android", "never matches"].includes(shim.platform)
      ).toBeTruthy();
    });

    it("provides a bug ID", () => {
      expect(shim.bug).toBeTruthy();
    });

    it("provides valid URLs", () => {
      expect(
        WebExtManifestSchmea.matchPatternsValid(shim.matches)
      ).toBeTruthy();
    });
  });
}
