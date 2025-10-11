# Relative Dates

A simple plugin for Obsidian that transforms date references in your task lists into color-coded pills that show relative dates.

## Features

- Converts date references in the format `📅 YYYY-MM-DD` (with optional time `HH:MM`) into relative date pills
- Works in both Reading mode and Live Preview mode
- Color-coded pills based on date proximity (overdue, today, tomorrow, this week, future)
- Customizable colors via settings

## Usage

Add dates in your task lists using the format:

- `📅 2025-08-12` for dates
- `📅 2025-08-12 14:30` for dates with time

The plugin will automatically convert these into easy-to-read pills such as:

<img src="images/screenshot-1.png" width="50%">

## Installation

1. Clone the repository to `.obsidian/plugins/`:
    ```sh
    git clone https://github.com/Munckenh/obsidian-relative-dates.git
    ```
2. Install the dependencies and compile:
    ```sh
    npm install
    npm run build
    ```
3. Enable the plugin in Obsidian

## Release

To release a new version of the plugin:

1. Update `manifest.json` with the new version number, such as `1.0.1`, and the minimum Obsidian version required for the latest release.
2. Run `npm version patch`, `npm version minor`, or `npm version major`.
3. Create new GitHub release using the new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
4. Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of the repository and also in the release.
5. Publish the release.

## Scripts

To manage the plugin, you can use the following scripts:

- Build the plugin by running `npm run build` or with live reload by running `npm run dev`
- Improve code quality (optional) by running `npm run lint`
