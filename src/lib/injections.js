/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* globals AVAILABLE_INJECTIONS, browser, filterOverrides, portsToAboutCompatTabs */

let InjectionsEnabled = true;

let port = browser.runtime.connect();
const ActiveInjections = new Map();

async function registerContentScripts() {
  const platformMatches = ["all"];
  let platformInfo = await browser.runtime.getPlatformInfo();
  platformMatches.push(platformInfo.os == "android" ? "android" : "desktop");

  for (const injection of AVAILABLE_INJECTIONS) {
    if (platformMatches.includes(injection.platform)) {
      injection.availableOnPlatform = true;
      await enableInjection(injection);
    }
  }

  InjectionsEnabled = true;
  portsToAboutCompatTabs.broadcast({interventionsChanged: filterOverrides(AVAILABLE_INJECTIONS)});
}

function replaceStringInRequest(requestId, inString, outString, inEncoding = "utf-8") {
  const filter = browser.webRequest.filterResponseData(requestId);
  const decoder = new TextDecoder(inEncoding);
  const encoder = new TextEncoder();
  const RE = new RegExp(inString, "g");
  const carryoverLength = inString.length;
  let carryover = "";
  filter.ondata = event => {
    const replaced = (carryover + decoder.decode(event.data, {stream: true})).replace(RE, outString);
    filter.write(encoder.encode(replaced.slice(0, -carryoverLength)));
    carryover = replaced.slice(-carryoverLength);
  };
  filter.onstop = event => {
    if (carryover.length) {
      filter.write(encoder.encode(carryover));
    }
    filter.close();
  };
}

async function enableInjection(injection) {
  if (injection.active) {
    return;
  }

  if ("pdk5fix" in injection) {
    const {urls, types} = injection.pdk5fix;
    const listener = injection.pdk5fix.listener = ({requestId}) => {
      replaceStringInRequest(requestId, "VideoContextChromeAndroid", "VideoContextAndroid");
      return {};
    };
    browser.webRequest.onBeforeRequest.addListener(listener, {urls, types}, ["blocking"]);
    injection.active = true;
    return;
  }

  try {
    const handle = await browser.contentScripts.register(injection.contentScripts);
    ActiveInjections.set(injection, handle);
    injection.active = true;
  } catch (ex) {
    console.error("Registering WebCompat GoFaster content scripts failed: ", ex);
  }
}

function unregisterContentScripts() {
  for (const injection of AVAILABLE_INJECTIONS) {
    disableInjection(injection);
  }
  InjectionsEnabled = false;
  portsToAboutCompatTabs.broadcast({interventionsChanged: false});
}

async function disableInjection(injection) {
  if (!injection.active) {
    return;
  }

  if (injection.pdk5fix) {
    const {listener} = injection.pdk5fix;
    browser.webRequest.onBeforeRequest.removeListener(listener);
    injection.active = false;
    delete injection.pdk5fix.listener;
    return;
  }

  const contentScript = ActiveInjections.get(injection);
  await contentScript.unregister();
  ActiveInjections.delete(injection);
  injection.active = false;
}

port.onMessage.addListener((message) => {
  switch (message.type) {
    case "injection-pref-changed":
      if (message.prefState) {
        registerContentScripts();
      } else {
        unregisterContentScripts();
      }
      break;
  }
});

const INJECTION_PREF = "perform_injections";
function checkInjectionPref() {
  browser.aboutConfigPrefs.getPref(INJECTION_PREF).then(value => {
    if (value === undefined) {
      browser.aboutConfigPrefs.setPref(INJECTION_PREF, true);
    } else if (value === false) {
      unregisterContentScripts();
    } else {
      registerContentScripts();
    }
  });
}
browser.aboutConfigPrefs.onPrefChange.addListener(checkInjectionPref, INJECTION_PREF);
checkInjectionPref();
