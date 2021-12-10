/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const WEBEXT_MATCH_PATTERN = new RegExp(
  "^(https?|wss?|file|ftp|\\*)://(\\*|\\*\\.[^*/]+|[^*/]+)/.*$",
  "i"
);

class WebextManifestSchema {
  static matchPatternsValid(patterns) {
    if (patterns === undefined) {
      return true;
    }
    return patterns.every(pattern => {
      if (typeof pattern == "string") {
        return pattern.match(WEBEXT_MATCH_PATTERN) !== null;
      } else {
        return this.matchPatternsValid(pattern.patterns);
      }
    });
  }
}

module.exports = WebextManifestSchema;
