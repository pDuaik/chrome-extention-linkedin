# LinkedIn Feed and News Hider

This Chrome extension hides distracting elements from LinkedIn ---
specifically the **main feed** and the **LinkedIn News** sidebar ---
using pure CSS.\
No JavaScript, no trackers, no nonsense. Just a simple stylesheet that
removes the endless scroll and noisy news column so you can focus on
what you actually came for.

------------------------------------------------------------------------

## ✨ What It Does

-   Hides the LinkedIn **main feed** (`<main aria-label="Main Feed">`)
-   Hides the **LinkedIn News** sidebar
    (`<aside aria-label="LinkedIn News">`)
-   Keeps the rest of the site (messages, jobs, notifications, etc.)
    fully functional

------------------------------------------------------------------------

## ⚙️ Installation Instructions

1.  **Download or clone** this project to your computer.

2.  Open Chrome and go to:

        chrome://extensions

3.  In the top right, turn on **Developer mode**.

4.  Click **Load unpacked**.

5.  Select the folder containing these files:

    -   `manifest.json`
    -   `hide.css`

6.  You'll see **LinkedIn Feed and News Hider** appear in your
    extensions list.

7.  Go to LinkedIn, refresh the page --- both the feed and the "LinkedIn
    News" sidebar will be gone.

------------------------------------------------------------------------

## 🧠 How It Works

This extension injects a single CSS file that hides sections of LinkedIn
by their accessible labels:

``` css
main[aria-label="Main Feed"] { display: none !important; }
aside[aria-label="LinkedIn News"] { display: none !important; }
```

It doesn't modify the page structure or run scripts, which makes it
lightweight and safe.

------------------------------------------------------------------------

## 🔒 Permissions

This extension uses **no JavaScript** and requires **no permissions**
beyond access to `linkedin.com` to inject CSS.

------------------------------------------------------------------------

## 🧩 Files

-   `manifest.json` --- declares the extension and injects the CSS.
-   `hide.css` --- the stylesheet that hides the unwanted sections.

------------------------------------------------------------------------

## 🪄 Optional Customisation

You can hide or reveal other parts of LinkedIn by inspecting elements
and adding their `aria-label` or class selectors to `hide.css`.

Example:

``` css
section[aria-label="People You May Know"] { display: none !important; }
```

------------------------------------------------------------------------

## 📜 License

MIT License --- free to use, modify, and share.

------------------------------------------------------------------------

## 💬 Author Note

This project was created to stop doom-scrolling while still allowing
normal LinkedIn use.\
Social media platforms won't give you an "off" button, so this extension
is yours.

Stay productive.
