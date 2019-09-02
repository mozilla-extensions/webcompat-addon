/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* globals module */

const CUSTOM_FUNCTIONS = {
  dtagFix: injection => {
    const { urls, contentType } = injection.data;
    const listener = (injection.data.listener = e => {
      e.responseHeaders.push(contentType);
      return { responseHeaders: e.responseHeaders };
    });

    browser.webRequest.onHeadersReceived.addListener(listener, { urls }, [
      "blocking",
      "responseHeaders",
    ]);
  },
  dtagFixDisable: injection => {
    const { listener } = injection.data;
    browser.webRequest.onHeadersReceived.removeListener(listener);
    delete injection.data.listener;
  },
};

module.exports = CUSTOM_FUNCTIONS;
