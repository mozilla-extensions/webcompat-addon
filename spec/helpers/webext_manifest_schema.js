/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const WEBEXT_MATCH_PATTERN = new RegExp(
  "^(https?|wss?|file|ftp|\\*)://(\\*|\\*\\.[^*/]+|[^*/]+)/.*$",
  "i"
);

module.exports = {
  matchPatternsValid: patterns => {
    return patterns.every(
      pattern => pattern.match(WEBEXT_MATCH_PATTERN) !== null
    );
  },
};
