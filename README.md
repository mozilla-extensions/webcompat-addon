# WebCompat Go Faster add-on

This is the development repository for the Firefox WebCompat Go Faster add-on.

## Writing site patches, overrides and injections

Detailed information on our policies on writing overrides, as well as technical information, can be found in the [Mozilla Wiki](https://wiki.mozilla.org/Compatibility/Go_Faster_Addon/Override_Policies_and_Workflows).

## Build instructions

This guide assumes you've got a copy of `mozilla-central` checked out on your machine and you already have set up Node.js 5 or newer. The build script assumes your `mozilla-central` is located at `../fx-team` relative to inside the root folder. If not, please set the `EXPORT_MC_LOCATION` environment accordingly.

Running the extension without a built and set up `mozilla-central` is not possible at the moment.

If this is the first time you're working with this repository, install the dependencies with `npm install`.

### Exporting the sources to `mozilla-central`

1. Ensure the version number is bumped in `package.json` and `src/manifest.json`, appropriately (see [Versioning Scheme](https://github.com/mozilla/webcompat-addon/wiki/Versioning-Scheme) for more info).
2. Run `npm run jake export-mc` for Desktop or `npm run jake export-mc-android` for Android.
3. Find the exported files in your `mozilla-central` directory, ready to commit.

### Exporting the sources into Android Components

1. Ensure the version number is bumped in `package.json` and `src/manifest.json`, appropriately (see [Versioning Scheme](https://github.com/mozilla/webcompat-addon/wiki/Versioning-Scheme) for more info).
2. Make sure the `EXPORT_AC_LOCATION` environment variable is set to the root of your Android Components checkout.
3. Run `npm run jake export-ac`.
4. Find the exported files in your Android Components directory, ready to commit.

### Run the changed extension sources

#### Via `about:debugging`

If you want to debug this extension on recent Desktop versions, you can use `about:debugging`:

1. Open `about:config` in Firefox
2. Set `extensions.experiments.enabled` pref to `true`
3. Open `about:debugging`
4. Click the `Load Temporary Add-on...` button
5. Select `./src/manifest.json` and hit open.
6. Test!

### Testing on the new Firefox for Android (Fenix)

Since the WebCompat feature inside Fenix is not shipped directly to the product but is included via a universal android component, you need both a local copy of Fenix and a local copy of Android-Components on your system. To build, make sure to follow the [Mozilla Android Components' instructions on how to test unreleased component code](https://mozac.org/contributing/testing-components-inside-app), and use the android-component exporter (see above) to get your sources into the repo.

#### Testing on the old Firefox for Android (Fennec)

Testing Fennec is relatively unsupported at this point, as most of the infrastructure has been deprecated. The easiest way to test changes for general contributors is to run a local Fenenc build with the changed sources exported to the codebase. For Mozillians with access to the Mozilla infrastructure, pushing to try and have the tryserver do the build can be an alternative for a one-off build. Also, there is a possible workaround to use `web-ext`, and you are encouraged to ping this project's maintainers if you have to test changes frequently.

### Building `webcompat.xpi`

1. Run `npm run jake export-xpi`.
2. Find the built `.xpi` inside the `build/` directory.

### Run the automated test suite

1. Run `npm run test`
2. Wait!

### Automatically check and adjust the code style

As `mozilla-central` is now mostly auto-formatted with prettier, and the config for that is really slim, this repo follows these guidelines. To automatically check and adjust the code style,

1. Run `npm run prettier`
2. Done.

### Run tests and codestyle checks automatically before pushing

If you want to make sure you don't push something that would fail on CI, use the `pre-push` hook supplied with this repository.

If your Git version is newer than 2.9.x, you can enable the hooks with

```
git config core.hooksPath .githooks
```

and if Git is older, please symlink the hook into the right directory manually with

```
ln -s .githooks/pre-push .git/hooks/
```

## License

MPL.
