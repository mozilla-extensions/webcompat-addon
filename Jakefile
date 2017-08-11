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
 * The directory where the source files are in.
 */
const SRC_DIR = "./src";

/**
 * List of files or directories that should not get exported into
 * mozilla-central.
 */
const BUILD_IGNORE_PATHS = [
  ".eslintrc.js"
];

/**
 * List of files or directories that should not get exported into
 * an .xpi.
 */
const XPI_IGNORE_PATHS = [
  "jar.mn",
  "moz.build",
  "test/"
];

/**
 * List of preprocessor defines that get applied whenever the preprocessor is
 * getting involved.
 */
const PREPREOCESSOR_DEFINES = {
  /**
   * These two get set by mach based on the current Firefox versions. We do
   * not have access to that information, which is why the MOZ_APP_VERSION
   * (the minimal version) is set to the first release this has ever been
   * tested in and the MOZ_APP_MAXVERSION is set to the current nightly.
   */
  "MOZ_APP_VERSION": "49.0a1",
  "MOZ_APP_MAXVERSION": "52.*"
};

/**
 * List of files that need preprocessing by the mozilla-central build
 * preprocessor when building the XPI.
 */
const PREPROCESS_FILES = [
  "install.rdf.in"
];

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
  let mcLocation = path.resolve(process.env.EXPORT_MC_LOCATION || "../gecko-dev");

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
 * Builds an argument string for the use with the preprocessor.
 *
 * @param {object} customVars name => value for additional variables to pass into the preprocessor
 * @returns {string} an argument string to pass to preprocessor.py
 */
function buildPreprocessorVariableArgs(customVars = {}) {
  let vars = Object.assign({}, PREPREOCESSOR_DEFINES, customVars);
  return Object.keys(vars)
    .map((name) => `-D ${name}='${vars[name]}'`)
    .join(" ");
}

/**
 * Preprocesses a file.
 *
 * @param {string} file the path to the file relative to BUILD_DIR
 * @param {object} customVars additional preprocessor variables for this file
 * @returns {promise}
 */
function preprocessFile(file, customVars = {}) {
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(path.join(BUILD_DIR, file)).isFile();
    } catch (ex) {
      reject(`Preprocess failed: no such file: ${file}`);
    }

    try {
      let scriptLocation = path.join(getMozillaCentralLocation(),
        "python/mozbuild/mozbuild/preprocessor.py");
      let ppArgs = buildPreprocessorVariableArgs(customVars);
      let inputFilename = path.join(BUILD_DIR, file);
      let outputFilename = path.join(BUILD_DIR, file.replace(".in", ""));
      let ppCall = `python ${scriptLocation} ${ppArgs} -o ${outputFilename} ${inputFilename}`;

      exec(ppCall, (error, stdout, stderr) => {
        if (error || stderr) {
          reject({error, stderr});
        }

        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * Generates a chrome.manifest from a jar.mn
 *
 * @returns {promise}
 */
function generateChromeManifest() {
  return new Promise((resolve, reject) => {
    let jarFilename = path.join(BUILD_DIR, "jar.mn");
    try {
      fs.statSync(jarFilename).isFile();
    } catch (ex) {
      reject("Building chrome.manifest failed: no such file: jar.mn");
    }

    let jarContents = fs.readFileSync(jarFilename).toString();
    let manifestContents = jarContents.split("\n")
      .filter((line) => line[0] === "%")
      .map((line) => line.replace(/%/g, "").trim())
      .join("\n");

    fs.writeFileSync(path.join(BUILD_DIR, "chrome.manifest"), manifestContents);
    resolve();
  });
}

desc(`Builds the extension into the ${BUILD_DIR}/ directory`);
task("build", ["building:cleanup", "building:copy"], () => {});

desc("Exports the sources into mozilla-central");
task("export-mc", ["build"], () => {
  let mcLocation = getMozillaCentralLocation();
  let extTargetDir = path.join(mcLocation, "browser/extensions/webcompat");
  jake.rmRf(extTargetDir);
  jake.cpR(BUILD_DIR, extTargetDir);

  console.log(`Exported built sources into ${extTargetDir}`);
});

desc("Exports the sources into an .xpi for update shipping");
task("export-xpi", ["build"], {async: true}, () => {
  Promise.all(PREPROCESS_FILES.map((ppFile) => preprocessFile(ppFile)))
    .then(() => generateChromeManifest())
    .then(() => {
      XPI_IGNORE_PATHS.concat(PREPROCESS_FILES).forEach((ignorePath) => {
        jake.rmRf(path.join(BUILD_DIR, ignorePath));
      });

      return jake.exec(`cd ${BUILD_DIR}; zip -r webcompat.xpi *`, complete);
    })
    .catch(console.error);
});

desc("Exports and runs the addon inside mozilla-central");
task("run-mc", ["export-mc"], {async: true}, () => {
  let mcLocation = getMozillaCentralLocation();
  jake.exec(
    `cd ${mcLocation}; ./mach build faster; ./mach run`,
    {printStdout: true},
    complete
  );
});

desc("Runs automated tests");
task("test", ["export-mc"], {async: true}, () => {
  let mcLocation = getMozillaCentralLocation();
  jake.exec(
    `cd ${mcLocation}; ./mach build faster; ./mach mochitest browser/extensions/webcompat`,
    {printStdout: true},
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
    BUILD_IGNORE_PATHS.forEach((ignorePath) => {
      jake.rmRf(path.join(BUILD_DIR, ignorePath));
    });
  });
});
