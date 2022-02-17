/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global complete, desc, jake, namespace, task */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

/**
 * The name of the extension as written in the manifest.json
 */

const EXTENSION_NAME = {
  default: "Web Compatibility Interventions",
  androidComponents:
    "Mozilla Android Components - Web Compatibility Interventions",
};

/**
 * The directory the extension files are copied into for exporting, linking,
 * etc.
 */
const BUILD_DIR = "./build";

/**
 * The directory the final .xpi will be exported to. Currently, this
 * uses the web-ext default directory to make this repo work with
 * the mozilla-extensions taskcluster template.
 */
const XPI_DIR = "./web-ext-artifacts";

/**
 * The directory where the source files are in.
 */
const SRC_DIR = "./src";

/**
 * List of files or directories that should not get exported into
 * mozilla-central.
 */
const BUILD_IGNORE_PATHS = [".eslintrc.js"];

/**
 * List of files or directories that should not get exported into
 * android_components.
 */
const AC_IGNORE_PATHS = ["components.conf", "moz.build", "tests"];

/**
 * List of files or directories that should not get exported into
 * an .xpi.
 */
const XPI_IGNORE_PATHS = ["components.conf", "moz.build", "tests"];

/**
 * You generally should not need to touch anything below this line for making
 * adjustments to the built product. If changes need to be made to the build
 * jobs itself, it's probably a wise idea to improve them.
 *
 * ============================================================================
 */

/**
 * @throws if m-c could not be found
 * @returns {string} the location of mozilla-central
 */
function getMozillaCentralLocation() {
  let mcLocation = path.resolve(
    process.env.EXPORT_MC_LOCATION || "../gecko-dev"
  );

  try {
    fs.statSync(mcLocation).isDirectory();
    fs.statSync(`${mcLocation}/mach`).isFile();
  } catch (ex) {
    throw new Error(`mozilla-central at ${mcLocation} not found. Please set
      the correct path into the EXPORT_MC_LOCATION environment variable!`);
  }

  return mcLocation;
}

/**
 * @throws if Android-Components could not be found
 * @returns {string} the location of AndroidComponents
 */
function getAndroidComponentsLocation() {
  let acLocation = path.resolve(
    process.env.EXPORT_AC_LOCATION || "../android-components"
  );

  try {
    fs.statSync(acLocation).isDirectory();
    fs.statSync(`${acLocation}/gradlew`).isFile();
  } catch (ex) {
    throw new Error(`android-components at ${acLocation} not found. Please set
      the correct path into the EXPORT_AC_LOCATION environment variable!`);
  }

  return acLocation;
}

/**
 * Replaces file list placeholders in moz.build and manifest.json
 *
 * returns {promise}
 */
function replaceFilelistPlaceholders(cssInjections, jsInjections, shims) {
  return new Promise((resolve, reject) => {
    let formatList = files => {
      files = files.map(filename => filename.replace("build/", ""));
      return `"${files.join(`",\n    "`)}",`;
    };

    let formatListForManifest = files => {
      files = files.map(filename => filename.replace("build/", ""));
      return `[\n    "${files.join(`",\n    "`)}"\n  ]`;
    };

    let mozBuildFilename = path.join(BUILD_DIR, "moz.build");
    let mozBuildContents = fs.readFileSync(mozBuildFilename).toString();
    mozBuildContents = mozBuildContents
      .replace("@CSS_INJECTIONS@", formatList(cssInjections))
      .replace("@JS_INJECTIONS@", formatList(jsInjections))
      .replace("@SHIMS@", formatList(shims));
    fs.writeFileSync(mozBuildFilename, mozBuildContents);

    let manifestFilename = path.join(BUILD_DIR, "manifest.json");
    let manifestContents = fs.readFileSync(manifestFilename).toString();
    manifestContents = manifestContents.replace(
      `["@WEB_ACCESSIBLE_RESOURCES@"]`,
      formatListForManifest(shims)
    );
    fs.writeFileSync(manifestFilename, manifestContents);

    resolve();
  });
}

/**
 * Sets the extension name in manifest.json
 *
 * returns {promise}
 */
function setExtensionName(name) {
  return new Promise((resolve, reject) => {
    let manifestFilename = path.join(BUILD_DIR, "manifest.json");
    let manifestContents = fs.readFileSync(manifestFilename).toString();
    manifestContents = manifestContents.replace(`@EXTENSION_NAME@`, name);
    fs.writeFileSync(manifestFilename, manifestContents);

    resolve();
  });
}

/**
 * Deletes a set of files from the build directory
 */
function deleteBuiltFiles(paths) {
  paths.forEach(ignorePath => {
    jake.rmRf(path.join(BUILD_DIR, ignorePath));
  });
}

/**
 * Exports the files to a target, used to export into mozilla-central
 */
function exportFiles(root, target) {
  let extTargetDir = path.join(root, target);
  jake.rmRf(extTargetDir);
  jake.cpR(BUILD_DIR, extTargetDir);

  console.log(`Exported built sources into ${extTargetDir}`);
}

desc(`Builds the extension into the ${BUILD_DIR}/ directory`);
task(
  "build",
  ["building:cleanup", "building:copy", "building:injectionfilelist"],
  () => {}
);

desc("Exports the sources into mozilla-central");
task("export-mc", ["build"], { async: true }, async () => {
  await setExtensionName(EXTENSION_NAME.default);
  exportFiles(getMozillaCentralLocation(), "browser/extensions/webcompat");
});

desc("Exports the sources into the android-components repo");
task("export-ac", ["build"], { async: true }, async () => {
  await setExtensionName(EXTENSION_NAME.androidComponents);
  deleteBuiltFiles(AC_IGNORE_PATHS);
  exportFiles(
    getAndroidComponentsLocation(),
    "components/feature/webcompat/src/main/assets/extensions/webcompat"
  );
});

desc("Exports the sources into an .xpi for update shipping");
task("export-xpi", ["build"], { async: true }, async () => {
  await setExtensionName(EXTENSION_NAME.default);
  deleteBuiltFiles(XPI_IGNORE_PATHS);
  jake.mkdirP(XPI_DIR);
  return jake.exec(
    `cd ${BUILD_DIR}; zip -r webcompat.xpi *; mv webcompat.xpi ../${XPI_DIR}`,
    complete
  );
});

namespace("building", () => {
  desc(`Removes the ${BUILD_DIR}/ directory`);
  task("cleanup", () => {
    jake.rmRf(BUILD_DIR);
  });

  desc(`Copies files into ${BUILD_DIR}/`);
  task("copy", () => {
    jake.cpR(SRC_DIR, BUILD_DIR);
    deleteBuiltFiles(BUILD_IGNORE_PATHS);
  });

  desc("Generates a list of injection files required for 'moz.build'");
  task("injectionfilelist", () => {
    let getFilelist = injectionType => {
      let files = path.join(BUILD_DIR, "injections", injectionType, "*");
      return new jake.FileList().include(files).toArray();
    };

    let getShimFilelist = () => {
      let files = path.join(BUILD_DIR, "shims/*");
      return new jake.FileList().include(files).toArray();
    };

    replaceFilelistPlaceholders(
      getFilelist("css"),
      getFilelist("js"),
      getShimFilelist()
    );
  });
});

namespace("lint", () => {
  desc("Checks that version numbers in package.json and manifest.json match");
  task("verify-version-match", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(SRC_DIR, "manifest.json")).toString()
    );

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(".", "package.json")).toString()
    );

    if (manifest["version"] !== packageJson["version"]) {
      console.error("Version number mismatch detected!");
      console.error(`  manifest.json: ${manifest["version"]}`);
      console.error(`  package.json:  ${packageJson["version"]}`);
      fail("Version numbers in package.json and manifest.json do not match!");
    }
  });

  desc("Overwrites version number in package.json with manifest data");
  task("set-package-version", { async: true }, async () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(SRC_DIR, "manifest.json")).toString()
    );

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(".", "package.json")).toString()
    );

    if (manifest["version"] !== packageJson["version"]) {
      // This generates a JSON object with the current data, but the version
      // property replaces with the manifest.json's value. It indents by two
      // spaces, and then adds a final newline to match what prettier would
      // give us.
      // An alternative approach would to just write unformatted JSON, and then
      // run prettier to make it match the codestyle. But for now, this appears
      // to be working fine.
      const newContents =
        JSON.stringify(
          Object.assign({}, packageJson, { version: manifest["version"] }),
          null,
          2
        ) + "\n";

      fs.writeFileSync(path.join(".", "package.json"), newContents);

      // package-lock.json also contains the version number. Instead of trying
      // to manually edit that file, let's run `npm install`, which will adjust
      // the lockfile's version number as well.
      // As all dependencies are hard-locked, this should not cause any
      // unexpected version changes.
      return jake.exec("npm install", complete);
    }
  });
});
