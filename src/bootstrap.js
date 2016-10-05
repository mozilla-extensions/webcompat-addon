/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* globals XPCOMUtils, UAOverrider UAOverrides */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "UAOverrider", "chrome://webcompat/content/lib/ua_overrider.js");
XPCOMUtils.defineLazyModuleGetter(this, "UAOverrides", "chrome://webcompat/content/data/ua_overrides.js");

let overrider;

function install() {} // eslint-disable-line no-unused-vars
function uninstall() {} // eslint-disable-line no-unused-vars

function startup() { // eslint-disable-line no-unused-vars
  overrider = new UAOverrider(UAOverrides);
  overrider.init();
}

function shutdown() { // eslint-disable-line no-unused-vars
  overrider.uninit();
}
