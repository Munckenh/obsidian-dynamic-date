# Dynamic Date

A simple plugin for Obsidian that transforms date references in task lists into color-coded, easy-to-read pills.

## Features

- Converts date references in the format `📅 YYYY-MM-DD` (with optional time `HH:MM`) into dynamic pills
- Works in both Reading mode and Live Preview mode
- Color-coded pills based on date proximity (overdue, today, tomorrow, this week, future)
- Customizable colors via settings

## Usage

Add dates in your task lists using the format:
- `📅 2025-08-12` for dates
- `📅 2025-08-12 14:30` for dates with time

The plugin will automatically convert these into easy-to-read pills like "Today", "Tomorrow", "Monday 2 PM", etc.

## Releasing new releases

- Update `manifest.json` with the new version number, such as `1.0.1`, and the minimum Obsidian version required for the latest release.
- Run `npm version patch`, `npm version minor`, or `npm version major`.
- Create new GitHub release using the new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of the repository and also in the release.
- Publish the release.