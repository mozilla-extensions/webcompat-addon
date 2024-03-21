/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const AVAILABLE_INJECTIONS = require("../src/data/injections.js");
const AVAILABLE_SHIMS = require("../src/data/shims.js");
const AVAILABLE_UA_OVERRIDES = require("../src/data/ua_overrides.js");

describe("all interventions", () => {
  it("provide a unique ID for all interventions", () => {
    let ids = new Set();
    let duplicates = new Set();

    for (const injection of [].concat(
      AVAILABLE_INJECTIONS,
      AVAILABLE_SHIMS,
      AVAILABLE_UA_OVERRIDES
    )) {
      let id = injection.id;
      if (ids.has(id)) {
        console.error(`Intervention ID ${id} is not unique!`);
        duplicates.add(id);
      } else {
        ids.add(id);
      }
    }

    expect(duplicates.size).toBe(0);
  });
});
