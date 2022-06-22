# Cryptomancer System

Cryptomancer RPG system for Foundry Virtual Tabletop

> Kill all the Orcs, Hack all the Things

![Supported Foundry Version Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fgithub.com%2FOfficerHalf%2Fcryptomancer-fvtt%2Freleases%2Flatest%2Fdownload%2Fsystem.json)
![Downloads badge](https://img.shields.io/github/downloads/OfficerHalf/cryptomancer-fvtt/total?color=%2370e6e6)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fcryptomancer&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=cryptomancer)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=OfficerHalf_cryptomancer-fvtt&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=OfficerHalf_cryptomancer-fvtt)

![System in Action](doc/cryptomancer.png)

## Prerequisites

A [FoundryVTT](https://foundryvtt.com/) license and a copy of [Cryptomancer](http://cryptorpg.com/).

## Install

### In Foundry

Search for Cryptomancer in the "Install System" dialog in Foundry.

### Manifest URL

Paste the manifest path into the "Manifest URL" field on the install system dialog in Foundry.

`https://github.com/OfficerHalf/cryptomancer-fvtt/releases/latest/download/system.json`

### Manually

Unzip `system.zip` from the latest release into your Foundry `Data/systems/cryptomancer` folder.

## Use

### Supported Features (so far!)

- Player Character sheets
- Skill checks with skill break/skill push and configurable check difficulty
- Stuff (consumables, equipment, outfits, weapons)
  - Item skill checks
  - Automatic DR tracking
- Talents and Spells
- Compendia containing all the Talents, Spells, and Stuff included in the core rules as well as Code and Dagger 1
- Party and Safehouse sheet

Note that while the system still has a version less than 1.0.0 there will be some inherent instability. Migrations will be performed, please raise an issue if there are problems going between versions.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).
