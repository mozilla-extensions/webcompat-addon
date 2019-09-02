/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * This mocks WebExtension APIs with noop functions so tests don't fail.
 * Generally, we only want to verify that those APIs are called with the right
 * paramaters, and not test the APIs themselves - those have in-tree tests,
 * and their API is considered stable, so we'd just be duplicating efforts here.
 */
jasmine.getGlobal().browser = {
  aboutConfigPrefs: {
    getPref: async () => {
      return true;
    },
    onPrefChange: {
      addListener: () => {},
    },
  },
  contentScripts: {
    register: () => {},
  },
  runtime: {
    getPlatformInfo: async () => {
      return {
        os: "test runner",
      };
    },
  },
  webRequest: {
    onBeforeRequest: {
      addListener: () => {},
    },
    onBeforeSendHeaders: {
      addListener: () => {},
    },
    onHeadersReceived: {
      addListener: () => {},
    },
  },
};
