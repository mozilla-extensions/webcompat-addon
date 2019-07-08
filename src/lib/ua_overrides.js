/**
 * For detailed information on our policies, and a documention on this format
 * and its possibilites, please check the Mozilla-Wiki at
 *
 * https://wiki.mozilla.org/Compatibility/Go_Faster_Addon/Override_Policies_and_Workflows#User_Agent_overrides
 */

"use strict";

/* globals AVAILABLE_UA_OVERRIDES, browser, filterOverrides, portsToAboutCompatTabs */

let UAOverridesEnabled = true;

const ActiveListeners = new Map();

function enableOverride(override) {
  if (override.active) {
    return;
  }

  const {matches, uaTransformer} = override.config;
  const listener = (details) => {
    for (var header of details.requestHeaders) {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = uaTransformer(header.value);
      }
    }
    return {requestHeaders: details.requestHeaders};
  };

  browser.webRequest.onBeforeSendHeaders.addListener(
    listener,
    {urls: matches},
    ["blocking", "requestHeaders"]
  );

  ActiveListeners.set(override, listener);
  override.active = true;
}

async function registerUAOverrides() {
  const platformMatches = ["all"];
  let platformInfo = await browser.runtime.getPlatformInfo();
  platformMatches.push(platformInfo.os == "android" ? "android" : "desktop");

  for (const override of AVAILABLE_UA_OVERRIDES) {
    if (platformMatches.includes(override.platform)) {
      override.availableOnPlatform = true;
      enableOverride(override);
    }
  }
  UAOverridesEnabled = true;
  portsToAboutCompatTabs.broadcast({overridesChanged: filterOverrides(AVAILABLE_UA_OVERRIDES)});
}

function unregisterUAOverrides() {
  for (const override of AVAILABLE_UA_OVERRIDES) {
    disableOverride(override);
  }
  UAOverridesEnabled = false;
  portsToAboutCompatTabs.broadcast({overridesChanged: false});
}

function disableOverride(override) {
  if (!override.active) {
    return;
  }

  browser.webRequest.onBeforeSendHeaders.removeListener(ActiveListeners.get(override));
  override.active = false;
  ActiveListeners.delete(override);
}

const OVERRIDE_PREF = "perform_ua_overrides";
function checkOverridePref() {
  browser.aboutConfigPrefs.getPref(OVERRIDE_PREF).then(value => {
    if (value === undefined) {
      browser.aboutConfigPrefs.setPref(OVERRIDE_PREF, true);
    } else if (value === false) {
      unregisterUAOverrides();
    } else {
      registerUAOverrides();
    }
  });
}
browser.aboutConfigPrefs.onPrefChange.addListener(checkOverridePref, OVERRIDE_PREF);
checkOverridePref();
