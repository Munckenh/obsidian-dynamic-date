# Dynamic Date

A simple plugin for Obsidian that transforms date references in task lists into colored, dynamic, easy-to-read pills.

## Releasing new releases

- Update `manifest.json` with the new version number, such as `1.0.1`, and the minimum Obsidian version required for the latest release.
- Run `npm version patch`, `npm version minor`, or `npm version major`.
- Create new GitHub release using the new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of the repository and also in the release.
- Publish the release.