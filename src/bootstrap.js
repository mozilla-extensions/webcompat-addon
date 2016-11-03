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

function startup() { // eslint-disable-line no-unused-vars
  // Intentionally set the preference to true on every browser restart to
  // avoid site breakage by accidentally toggled preferences or by leaving
  // it off after debugging a site.
  Services.prefs.setBoolPref(UA_ENABLE_PREF_NAME, true);
  Services.prefs.addObserver(UA_ENABLE_PREF_NAME, UAEnablePrefObserver, false);

  overrider = new UAOverrider(UAOverrides);
  overrider.init();
}

function shutdown() { // eslint-disable-line no-unused-vars
  Services.prefs.removeObserver(UA_ENABLE_PREF_NAME, UAEnablePrefObserver);

  if (overrider) {
    overrider.uninit();
  }
}
