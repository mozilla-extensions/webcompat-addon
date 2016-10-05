/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is an array of objects that specify user agent overrides. Each object
 * can have three attributes:
 *
 *   * `baseDomain`, required: The base domain that further checks and user
 *     agents override are applied to. This does not include subdomains.
 *   * `uriMatcher`: Function that gets the requested URI passed in the first
 *     argument and needs to return boolean wheather or not the override should
 *     be applied. If not provided, the user agent override will be applied
 *     every time.
 *   * `uaTransformer`, required: Function that gets the original Firefox user
 *     agent passed as its first argument and needs to return a string that
 *     will be used as the the user agent for this URI.
 *
 * Examples:
 *
 * Gets applied for all requests to mozilla.org and subdomains:
 *
 * ```
 *   {
 *     baseDomain: "mozilla.org",
 *     uaTransformer: (originalUA) => `Ohai Mozilla, it's me, ${originalUA}`
 *   }
 * ```
 *
 * Applies to *.example.com/app/*:
 *
 * ```
 *   {
 *     baseDomain: "example.com",
 *     uriMatcher: (uri) => uri.includes("/app/"),
 *     uaTransformer: (originalUA) => originalUA.replace("Firefox", "Otherfox")
 *   }
 * ```
 */

const UAOverrides = [ // eslint-disable-line
];

this.EXPORTED_SYMBOLS = ["UAOverrides"];
