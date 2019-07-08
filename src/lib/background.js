/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* global AVAILABLE_INJECTIONS, AVAILABLE_UA_OVERRIDES, browser,
          disableInjection, disableOverride, enableInjection, enableOverride,
          InjectionsEnabled, UAOverridesEnabled */

function getOverrideOrInterventionById(id) {
  for (const [type, things] of Object.entries({
    overrides: AVAILABLE_UA_OVERRIDES,
    interventions: AVAILABLE_INJECTIONS,
  })) {
    for (const what of things) {
      if (what.id === id) {
        return {type, what};
      }
    }
  }
  return {};
}

const portsToAboutCompatTabs = (function() {
  const ports = new Set();

  browser.runtime.onConnect.addListener(port => {
    ports.add(port);
    port.onDisconnect.addListener(function() {
      ports.delete(port);
    });
  });

  async function broadcast(message) {
    for (const port of ports) {
      port.postMessage(message);
    }
  }

  return {broadcast};
}());

function filterOverrides(overrides) {
  return overrides.filter(override => override.availableOnPlatform).map(override => {
    const {id, active, bug, domain} = override;
    return {id, active, bug, domain};
  });
}

browser.runtime.onMessage.addListener(msg => {
  switch (msg.command || msg) {
    case "toggle": {
      const id = msg.id;
      const {type, what} = getOverrideOrInterventionById(id);
      if (!what) {
        return Promise.reject(`No such override or intervention to toggle: ${id}`);
      }
      portsToAboutCompatTabs.broadcast({toggling: id, active: what.active}).then(async () => {
        switch (type) {
          case "interventions": {
            if (what.active) {
              await disableInjection(what);
            } else {
              await enableInjection(what);
            }
            break;
          }
          case "overrides": {
            if (what.active) {
              await disableOverride(what);
            } else {
              await enableOverride(what);
            }
            break;
          }
        }
        portsToAboutCompatTabs.broadcast({toggled: id, active: what.active});
      });
      break;
    }
    case "getOverridesAndInterventions": {
      return Promise.resolve({
        overrides: UAOverridesEnabled && filterOverrides(AVAILABLE_UA_OVERRIDES) || false,
        interventions: InjectionsEnabled && filterOverrides(AVAILABLE_INJECTIONS) || false,
      });
    }
  }
  return undefined;
});
