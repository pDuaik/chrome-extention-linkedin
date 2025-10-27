# LinkedIn Feed Toggle Extension

This Chrome extension lets you block or allow the LinkedIn feed on
demand with a simple toggle button.

## Overview

The extension deletes the main feed container
(`.scaffold-finite-scroll.scaffold-finite-scroll--infinite`) on the
LinkedIn home page (`/feed`) whenever the toggle is ON.\
It works on both normal reloads and LinkedIn's single-page-app
navigation.

## Features

-   Toggle on/off directly from the popup menu.
-   Remembers your setting across sessions.
-   Works even when navigating LinkedIn without reloading.
-   Minimal permissions: `storage`, `tabs`, and access to
    `linkedin.com`.

## Installation

1.  Clone or download this repository.
2.  Open **chrome://extensions** in Chrome.
3.  Turn on **Developer mode**.
4.  Click **Load unpacked** and select the extension folder.
5.  The extension icon will appear in your toolbar.

## Files

-   **manifest.json** -- Declares extension metadata and permissions.
-   **popup.html** / **popup.js** -- Simple UI with the toggle button.
-   **content.js** -- Handles feed deletion logic and SPA behaviour.
-   **icons/** -- Optional folder for extension icons.

## Behaviour

-   When the toggle is **ON**, the feed on `/feed` is deleted instantly
    and kept deleted as you navigate.
-   When **OFF**, LinkedIn behaves normally.
-   The setting persists via Chrome's storage.

## Notes

If LinkedIn changes their HTML and the feed reappears, update the
selector in `content.js`:

``` js
const FEED_SELECTOR = '.scaffold-finite-scroll.scaffold-finite-scroll--infinite';
```

Adjust it to match the new class name if needed.

## License

This project is distributed under the MIT License.
