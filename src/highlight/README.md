# Highlight JS Lite (HLJSL) Plugin for Reveal

Lectures uses a wrapped version of highlight.js that is then registered with Reveal in place of the default highlight plugin.

## How to Update

1. Delete the old HLJSL files in this directory being careful not to delete files needed by Lectures.
2. Grab the latest version of HLJSL from [this release page](https://github.com/caboodle-tech/highlight-js-lite/releases). The zip folder should have semantic versioning numbers as part of the name.
3. Extract all the files into this directory.
4. Update the `build.json` file for this directory if needed.
5. Rename the `hljsl.min.css` to `hljsl.min.scss` so it can be auto built into Lectures theme.
6. Run `npm run build` to compile the entire application.