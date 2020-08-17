/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global complete, desc, jake, namespace, task */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

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
const AC_IGNORE_PATHS = ["moz.build"];

/**
 * List of files or directories that should not get exported into
 * an .xpi.
 */
const XPI_IGNORE_PATHS = ["moz.build"];

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
 * Replaces file list placeholders in moz.build
 *
 * returns {promise}
 */
function replaceFilelistPlaceholders(cssInjections, jsInjections, shims) {
  return new Promise((resolve, reject) => {
    let formatList = files => {
      files = files.map(filename => filename.replace("build/", ""));
      return "'" + files.join("',\n  '") + "',";
    };

    let formatListForManifest = files => {
      files = files.map(filename => filename.replace("build/", ""));
      return `[\n    "${files.join(`",\n    "`)}"\n  ]`;
    };

    let mozBuildFilename = path.join(BUILD_DIR, "moz.build");
    try {
      fs.statSync(mozBuildFilename).isFile();
    } catch (ex) {
      reject("Cannot generate the injection file list: no moz.build");
    }

    let manifestFilename = path.join(BUILD_DIR, "manifest.json");
    try {
      fs.statSync(manifestFilename).isFile();
    } catch (ex) {
      reject("Cannot generate the injection file list: no manifest.json");
    }

    let mozBuildContents = fs.readFileSync(mozBuildFilename).toString();
    mozBuildContents = mozBuildContents
      .replace("@CSS_INJECTIONS@", formatList(cssInjections))
      .replace("@JS_INJECTIONS@", formatList(jsInjections))
      .replace("@SHIMS@", formatList(shims));

    fs.writeFileSync(mozBuildFilename, mozBuildContents);

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
function exportFiles(root, target, alsoExportTestsDir = false) {
  let extTargetDir = path.join(root, target);
  jake.rmRf(extTargetDir);
  jake.cpR(BUILD_DIR, extTargetDir);
  if (!alsoExportTestsDir) {
    const testsDir = path.join(extTargetDir, "tests");
    jake.rmRf(testsDir);
  }

  console.log(`Exported built sources into ${extTargetDir}`);
}

desc(`Builds the extension into the ${BUILD_DIR}/ directory`);
task(
  "build",
  ["building:cleanup", "building:copy", "building:injectionfilelist"],
  () => {}
);

desc("Exports the sources into mozilla-central");
task("export-mc", ["build"], () => {
  exportFiles(
    getMozillaCentralLocation(),
    "browser/extensions/webcompat",
    true
  );
});

desc("Exports the sources into the mozilla-central for android");
task("export-mc-android", ["build"], () => {
  exportFiles(
    getMozillaCentralLocation(),
    "mobile/android/extensions/webcompat"
  );
});

desc("Exports the sources into the android-components repo");
task("export-ac", ["build"], () => {
  deleteBuiltFiles(AC_IGNORE_PATHS);
  exportFiles(
    getAndroidComponentsLocation(),
    "components/feature/webcompat/src/main/assets/extensions/webcompat"
  );
});

desc("Exports the sources into an .xpi for update shipping");
task("export-xpi", ["build"], { async: true }, () => {
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
