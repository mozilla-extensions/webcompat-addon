/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

add_setup(async function () {
  await UrlClassifierTestUtils.addTestTrackers();

  registerCleanupFunction(() => {
    UrlClassifierTestUtils.cleanupTestTrackers();
    Services.prefs.clearUserPref(TRACKING_PREF);
  });
});

add_task(async function test_smartblock_embed_replaced() {
  Services.prefs.setBoolPref(TRACKING_PREF, true);
  Services.fog.testResetFOG();

  let clickToggle = async toggle => {
    let changed = BrowserTestUtils.waitForEvent(toggle, "toggle");
    await EventUtils.synthesizeMouseAtCenter(toggle.buttonEl, {});
    await changed;
  };

  let closeProtectionsPanel = async (win = window) => {
    let protectionsPopup = win.document.getElementById("protections-popup");
    if (!protectionsPopup) {
      return;
    }
    let popuphiddenPromise = BrowserTestUtils.waitForEvent(
      protectionsPopup,
      "popuphidden"
    );

    PanelMultiView.hidePopup(protectionsPopup);
    await popuphiddenPromise;
  };

  let openProtectionsPanel = async (win = window) => {
    let popupShownPromise = BrowserTestUtils.waitForEvent(
      win,
      "popupshown",
      true,
      e => e.target.id == "protections-popup"
    );

    win.gProtectionsHandler.showProtectionsPopup();

    await popupShownPromise;
  };

  // Open a site with a test "embed"
  const tab = await BrowserTestUtils.openNewForegroundTab({
    gBrowser,
    waitForLoad: true,
  });

  let smartblockScriptFinished = BrowserTestUtils.waitForContentEvent(
    tab.linkedBrowser,
    "smartblockEmbedScriptFinished",
    false,
    null,
    true
  );

  BrowserTestUtils.startLoadingURIString(
    tab.linkedBrowser,
    TEST_PAGE_WITH_SMARTBLOCK_COMPATIBLE_EMBED
  );

  await smartblockScriptFinished;

  // Check TP enabled
  const TrackingProtection = gProtectionsHandler.blockers.TrackingProtection;
  ok(TrackingProtection, "TP is attached to the tab");
  ok(TrackingProtection.enabled, "TP is enabled");

  // Setup promise for listening for protections panel open
  let popupShownPromise = BrowserTestUtils.waitForEvent(
    window,
    "popupshown",
    true,
    e => e.target.id == "protections-popup"
  );

  await SpecialPowers.spawn(tab.linkedBrowser, [], async () => {
    // Check that the "embed" was replaced with a placeholder
    let placeholder = content.document.querySelector(
      ".shimmed-embedded-content"
    );
    ok(placeholder, "Embed is replaced with a placeholder");

    // Get the button element from the placeholder
    let shadowRoot = placeholder.openOrClosedShadowRoot;
    ok(shadowRoot, "Shadow root exists");

    // Check that all elements are present
    let placeholderButton = shadowRoot.querySelector(
      "#smartblock-placeholder-button"
    );
    ok(placeholderButton, "Placeholder button exists");

    let placeholderTitle = shadowRoot.querySelector(
      "#smartblock-placeholder-title"
    );
    ok(placeholderTitle, "Placeholder title exists");

    let placeholderLabel = shadowRoot.querySelector(
      "#smartblock-placeholder-desc"
    );
    ok(placeholderLabel, "Placeholder description exists");

    let placeholderImage = shadowRoot.querySelector(
      "#smartblock-placeholder-image"
    );
    ok(placeholderImage, "Placeholder image exists");

    // Click button to open protections panel
    await EventUtils.synthesizeMouseAtCenter(placeholderButton, {}, content);
  });

  // If this await finished, then protections panel is open
  await popupShownPromise;

  // Check telemetry is triggered
  let protectionsPanelOpenEvents =
    Glean.securityUiProtectionspopup.openProtectionsPopup.testGetValue();
  is(
    protectionsPanelOpenEvents.length,
    1,
    "Protections panel open telemetry has correct embeds shown value"
  );
  is(
    protectionsPanelOpenEvents[0].extra.openingReason,
    "embedPlaceholderButton",
    "Protections panel open telemetry has correct opening reason"
  );
  is(
    protectionsPanelOpenEvents[0].extra.smartblockEmbedTogglesShown,
    "true",
    "Protections panel open telemetry has correct toggles shown value"
  );

  // Check smartblock section is unhidden
  ok(
    BrowserTestUtils.isVisible(
      gProtectionsHandler._protectionsPopupSmartblockContainer
    ),
    "Smartblock section is visible"
  );

  // Check toggle is present and off
  let blockedEmbedToggle =
    gProtectionsHandler._protectionsPopupSmartblockToggleContainer
      .firstElementChild;
  ok(blockedEmbedToggle, "Toggle exists in container");
  ok(BrowserTestUtils.isVisible(blockedEmbedToggle), "Toggle is visible");
  ok(
    !blockedEmbedToggle.hasAttribute("pressed"),
    "Unblock toggle should be off"
  );

  // Setup promise on custom event to wait for placeholders to finish replacing
  let embedScriptFinished = BrowserTestUtils.waitForContentEvent(
    tab.linkedBrowser,
    "testEmbedScriptFinished",
    false,
    null,
    true
  );

  // Click to toggle to unblock embed and wait for script to finish
  await clickToggle(blockedEmbedToggle);

  await embedScriptFinished;

  await SpecialPowers.spawn(tab.linkedBrowser, [], () => {
    let unloadedEmbed = content.document.querySelector(".broken-embed-content");
    ok(!unloadedEmbed, "Unloaded embeds should not be on the page");

    // Check embed was put back on the page
    let loadedEmbed = content.document.querySelector(".loaded-embed-content");
    ok(loadedEmbed, "Embed should now be on the page");
  });

  // Check toggle telemetry is triggered
  let toggleEvents =
    Glean.securityUiProtectionspopup.clickSmartblockembedsToggle.testGetValue();
  is(toggleEvents.length, 1, "Telemetry triggered for toggle press");
  is(
    toggleEvents[0].extra.isBlock,
    "false",
    "Toggle press telemetry is an unblock"
  );
  is(
    toggleEvents[0].extra.openingReason,
    "embedPlaceholderButton",
    "Smartblock shown event has correct reason"
  );

  // close and open protections panel
  await closeProtectionsPanel(window);

  // Verify telemetry after close
  let protectionsPanelClosedEvents =
    Glean.securityUiProtectionspopup.closeProtectionsPopup.testGetValue();
  is(
    protectionsPanelClosedEvents.length,
    1,
    "Telemetry triggered for protections panel closed"
  );
  is(
    protectionsPanelClosedEvents[0].extra.smartblockToggleClicked,
    "true",
    "Protections panel closed telemetry shows toggle was clicked"
  );
  is(
    protectionsPanelClosedEvents[0].extra.openingReason,
    "embedPlaceholderButton",
    "Protections panel closed event has correct reason"
  );

  await openProtectionsPanel(window);

  // Check if smartblock section is still there after unblock
  ok(
    BrowserTestUtils.isVisible(
      gProtectionsHandler._protectionsPopupSmartblockContainer
    ),
    "Smartblock section is visible"
  );

  // Check toggle is still there and is on now
  blockedEmbedToggle =
    gProtectionsHandler._protectionsPopupSmartblockToggleContainer
      .firstElementChild;
  ok(blockedEmbedToggle, "Toggle exists in container");
  ok(BrowserTestUtils.isVisible(blockedEmbedToggle), "Toggle is visible");
  ok(blockedEmbedToggle.hasAttribute("pressed"), "Unblock toggle should be on");

  // Check protections panel open telemetry
  // Check telemetry is triggered
  protectionsPanelOpenEvents =
    Glean.securityUiProtectionspopup.openProtectionsPopup.testGetValue();
  is(
    protectionsPanelOpenEvents.length,
    2,
    "Protections panel open telemetry has correct embeds shown value"
  );
  // Note: the openingReason shows as undefined since the test opened the
  // protections panel directly with a function call"
  is(
    protectionsPanelOpenEvents[1].extra.openingReason,
    undefined,
    "Protections panel open telemetry has correct opening reason"
  );
  is(
    protectionsPanelOpenEvents[1].extra.smartblockEmbedTogglesShown,
    "true",
    "Protections panel open telemetry has correct toggles shown value"
  );

  // Setup promise on custom event to wait for placeholders to finish replacing
  smartblockScriptFinished = BrowserTestUtils.waitForContentEvent(
    tab.linkedBrowser,
    "smartblockEmbedScriptFinished",
    false,
    null,
    true
  );

  // click toggle to reblock (this will trigger a reload)
  clickToggle(blockedEmbedToggle);

  // Wait for smartblock embed script to finish
  await smartblockScriptFinished;

  await SpecialPowers.spawn(tab.linkedBrowser, [], () => {
    // Check that the "embed" was replaced with a placeholder
    let placeholder = content.document.querySelector(
      ".shimmed-embedded-content"
    );

    ok(placeholder, "Embed replaced with a placeholder after reblock");
  });

  // Check toggle telemetry is triggered
  toggleEvents =
    Glean.securityUiProtectionspopup.clickSmartblockembedsToggle.testGetValue();
  is(toggleEvents.length, 2, "Telemetry triggered for toggle press");
  is(
    toggleEvents[1].extra.isBlock,
    "true",
    "Toggle press telemetry is a block"
  );
  // Note: the openingReason shows as undefined since the test opened the
  // protections panel directly with a function call"
  is(
    toggleEvents[1].extra.openingReason,
    undefined,
    "Smartblock shown event has correct reason"
  );

  await BrowserTestUtils.removeTab(tab);
});
