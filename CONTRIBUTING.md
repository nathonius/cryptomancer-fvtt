# Setup

1. Clone this repo somewhere OTHER than your Foundry data folder
2. `cd cryptomancer-fvtt`
3. `npm install`
4. Create a copy of `sample.env` named `.env` and update the path in the new `.env` file to match your Foundry data directory

# Build

The system is written in TypeScript, so there is a build step. Everything is automated through Rollup.

## Build System

`npm run build`

This will clean the `dist` folder if it exists and build the source to that folder.

## Watch

`npm run watch`

On file changes, will execute a build, then serve the new files to the folder configured in `.env`. To see updates in Foundry, refresh the window (requires devtools to be open if using the electron client) or return to setup and restart the game world.

# Debugging

## Migrations

Using the [Developer Mode](https://github.com/League-of-Foundry-Developers/foundryvtt-devMode) module, if the Cryptomancer debug flag is enabled, migrations will always run, regardless of the current version.

# Release Process

1. Merge all changes for this release to `next` branch.
2. If migrations are needed, bump the `NEEDS_MIGRATION_VERSION` in `cryptomancer.ts` to the new version that is about to be released. Commit this change.
3. Run the appropriate release script:
   - `release:patch`, `release:minor`, or `release:major`
   - This will generate the changelog and bump all versions in necessary places.
4. Push release commit to `next` branch and create a PR to `main`.
   - Make sure tags are pushed as well.
5. After the PR is merged, checkout the latest `main` and build, `npm run build`.
6. Zip the contents of the `dist` folder into `system.zip`.
7. Create a new release with the tag created by the release job.
   - Copy the contents of the changelog entry for this release to the release changelog.
   - Add the zipped system as well as `system.json` from the `dist` folder to the release artifacts.
8. Add a new version on the [Foundry admin interface](https://foundryvtt.com/admin/).
