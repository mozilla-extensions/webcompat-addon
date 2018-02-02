WebCompat Go Faster add-on
==========================

This is the development repository for the Firefox WebCompat Go Faster add-on

Writing site patches, overrides and injections
----------------------------------------------

Detailed information on our policies on writing overrides, as well as technical
information, can be found in the [Mozilla Wiki](https://wiki.mozilla.org/Compatibility/Go_Faster_Addon/Override_Policies_and_Workflows).

Build instructions
------------------

This guide assumes you've got a copy of `mozilla-central` checked out on your
machine and you already have set up Node.js 5 or newer. The build script
assumes your `mozilla-central` is located at `../fx-team` relative to inside
the root folder. If not, please set the `EXPORT_MC_LOCATION` environment
accordingly.

Running the extension without a built and set up `mozilla-central` is not
possible at the moment.

If this is the first time you're working with this repository, install the
dependencies with `npm install`.

### Exporting the sources to `mozilla-central`

1. Run `npm run jake export-mc`.
2. Find the exported files in your `mozilla-central` directory, ready to commit.

### Run the changed extension sources

1. Run `npm run jake run-mc`
2. Test!

### Building `webcompat.xpi`

1. Run `npm run jake export-xpi`.
2. Find the built `.xpi` inside the `build/` directory.

### Run the automated test suite

1. Run `npm run jake test`
2. Wait!

License
-------

MPL.
