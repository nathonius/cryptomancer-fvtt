# Setup

1. Clone this repo somewhere OTHER than your Foundry data folder
2. `cd cryptomancer-fvtt`
3. `npm install`
4. Update the path in `.env` to match your Foundry installation

# Build

The system is written in TypeScript, so there is a build step. Everything is automated through Rollup.

## Build System

`npm run build`

This will clean the `dist` folder if it exists and build the source to that folder.

## Watch

`npm run watch`

On file changes, will execute a build, then serve the new files to the folder configured in `.env`. To see updates in foundry, return to setup and restart the game world.
