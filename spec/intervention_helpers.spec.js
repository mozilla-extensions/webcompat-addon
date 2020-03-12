/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const InterventionHelpers = require("../src/lib/intervention_helpers");

describe("InterventionHelpers", () => {
  describe("matchPatternsForTLDs", () => {
    it("returns an array of match patterns for a given base domain", () => {
      let patterns = InterventionHelpers.matchPatternsForTLDs(
        "*://mozilla.",
        "/*",
        ["com", "org"]
      );

      expect(patterns.length).toBe(2);
      expect(patterns).toContain("*://mozilla.com/*");
      expect(patterns).toContain("*://mozilla.org/*");
    });
  });

  describe("matchPatternsForGoogle", () => {
    it("returns an array of match patterns for a given google domain", () => {
      let patterns = InterventionHelpers.matchPatternsForGoogle(
        "*://www.google.",
        "/maps*"
      );

      expect(patterns).toContain("*://www.google.com/maps*");
      expect(patterns).toContain("*://www.google.de/maps*");
    });
  });
});
