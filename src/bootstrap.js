/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* globals XPCOMUtils, Services, UAOverrider UAOverrides */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const UA_ENABLE_PREF_NAME = "extensions.webcompat.perform_ua_overrides";

XPCOMUtils.defineLazyModuleGetter(this, "Services", "resource://gre/modules/Services.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "UAOverrider", "chrome://webcompat/content/lib/ua_overrider.js");
XPCOMUtils.defineLazyModuleGetter(this, "UAOverrides", "chrome://webcompat/content/data/ua_overrides.js");

let overrider;
let tabUpdateHandler;

function UAEnablePrefObserver() {
  let isEnabled = Services.prefs.getBoolPref(UA_ENABLE_PREF_NAME);
  if (isEnabled && !overrider) {
    overrider = new UAOverrider(UAOverrides);
    overrider.init();
  } else if (!isEnabled && overrider) {
    overrider.uninit();
    overrider = false;
  }
}

function install() {} // eslint-disable-line no-unused-vars
function uninstall() {} // eslint-disable-line no-unused-vars

function startup({webExtension}) {
  // Intentionally set the preference to true on every browser restart to
  // avoid site breakage by accidentally toggled preferences or by leaving
  // it off after debugging a site.
  Services.prefs.setBoolPref(UA_ENABLE_PREF_NAME, true);
  Services.prefs.addObserver(UA_ENABLE_PREF_NAME, UAEnablePrefObserver, false);

  overrider = new UAOverrider(UAOverrides);
  overrider.init();

  // Init webExtension to listen tab update status
  webExtension.startup().then((api) => {
    const {browser} = api;
    // tabUpdateHandler receives tab updated event from WebExtension tablog.js
    // While tab status changes to loading, tablog.js queries this URI is overrided or not.
    // tabUpdateHandler uses sendResponse sends result to tablog.js
    // tablog.js can determine to print web console log or not.
    tabUpdateHandler = function(message, sender, sendResponse) {
      try {
        if (overrider) {
          let uaOverride = overrider.getUAForURI(Services.io.newURI(message.url, null, null));
          sendResponse({reply: !!uaOverride});
        }
      } catch (exception) {
        sendResponse({reply: false});
      }
    };

    browser.runtime.onMessage.addListener(tabUpdateHandler);
    return;
  }).catch((reason) => {
    console.log(reason);
  });
}

// TODO: Figure out how to remove listener when bootstrapped addon shutdown
function shutdown() { // eslint-disable-line no-unused-vars
  Services.prefs.removeObserver(UA_ENABLE_PREF_NAME, UAEnablePrefObserver);

  if (overrider) {
    overrider.uninit();
  }
}
