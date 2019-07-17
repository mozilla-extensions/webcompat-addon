/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const fs = require("fs");
const path = require("path");

const AVAILABLE_INJECTIONS = require("../src/data/injections");

describe("AVAILABLE_INJECTIONS", () => {
  it("contains at least one injection definition", () => {
    expect(AVAILABLE_INJECTIONS.length).toBeGreaterThanOrEqual(1);
  });

  it("provide a unique ID for each injection", () => {
    let ids = new Set();
    let duplicates = new Set();

    for (const injection of AVAILABLE_INJECTIONS) {
      let id = injection.id;
      if (ids.has(id)) {
        console.error(`ID ${id} is not unique!`);
        duplicates.add(id);
      } else {
        ids.add(id);
      }
    }

    expect(duplicates.size).toBe(0);
  });
});

for (const injection of AVAILABLE_INJECTIONS) {
  describe(`Injection #${injection.id}`, () => {
    it("provides an ID", () => {
      expect(injection.id).toBeTruthy();
    });

    it("provides a valid platform", () => {
      expect(
        ["all", "desktop", "android"].includes(injection.platform)
      ).toBeTruthy();
    });

    it("provides a domain", () => {
      expect(injection.domain).toBeTruthy();
    });

    it("provides a bug ID", () => {
      expect(injection.bug).toBeTruthy();
    });

    if (injection.contentScripts) {
      it("provides a contentScript matches scope", () => {
        expect(injection.contentScripts.matches).toBeTruthy();
      });

      it("provides valid filenames for contentScripts", () => {
        for (let type of ["css", "js"]) {
          if (!injection.contentScripts[type]) {
            continue;
          }

          let filename = path.join(
            "src/",
            injection.contentScripts[type][0].file
          );
          let exists = fs.existsSync(filename);
          expect(exists).toBe(true);
        }
      });
    }
  });
}
