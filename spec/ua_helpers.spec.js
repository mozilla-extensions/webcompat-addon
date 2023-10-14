/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const UAHelpers = require("../src/lib/ua_helpers");

const WINDOWS_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0";
const MACOS_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0";
const ANDROID_UA =
  "Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0";
const LINUX_UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
const VERSION_109_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/118.0";
const VERSION_108_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0";
const VERSION_99_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0";

describe("UAHelpers", () => {
  describe("capRvTo109 function ", () => {
    it("Caps the segment to rv:109.0", async () => {
      const cappedWindowsUA = UAHelpers.capRvTo109(WINDOWS_UA);
      expect(cappedWindowsUA).toBe(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0"
      );

      const cappedMacOSUA = UAHelpers.capRvTo109(MACOS_UA);
      expect(cappedMacOSUA).toBe(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0"
      );

      const cappedAndroidUA = UAHelpers.capRvTo109(ANDROID_UA);
      expect(cappedAndroidUA).toBe(
        "Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/120.0 Firefox/120.0"
      );

      const cappedLinuxUA = UAHelpers.capRvTo109(LINUX_UA);
      expect(cappedLinuxUA).toBe(
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0"
      );
    });

    it("doesn't change the segment if it's 109 or less", async () => {
      const unchangedUA = UAHelpers.capRvTo109(VERSION_109_UA);
      expect(unchangedUA).toBe(VERSION_109_UA);

      const olderUA = UAHelpers.capRvTo109(VERSION_108_UA);
      expect(olderUA).toBe(VERSION_108_UA);
    });
  });

  describe("capVersionTo99 function ", () => {
    it("Caps the version to 99.0", async () => {
      const cappedWindowsUA = UAHelpers.capVersionTo99(WINDOWS_UA);
      expect(cappedWindowsUA).toBe(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0"
      );

      const cappedMacOSUA = UAHelpers.capVersionTo99(MACOS_UA);
      expect(cappedMacOSUA).toBe(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0"
      );

      const cappedAndroidUA = UAHelpers.capVersionTo99(ANDROID_UA);
      expect(cappedAndroidUA).toBe(
        "Mozilla/5.0 (Android 13; Mobile; rv:99.0) Gecko/120.0 Firefox/99.0"
      );

      const cappedLinuxUA = UAHelpers.capVersionTo99(LINUX_UA);
      expect(cappedLinuxUA).toBe(
        "Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0"
      );
    });

    it("doesn't change the version if it's 99 or less", async () => {
      const unchangedUA = UAHelpers.capVersionTo99(VERSION_99_UA);
      expect(unchangedUA).toBe(VERSION_99_UA);
    });
  });
});
