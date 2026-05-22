# Lightweight Dark Mode Viewer

A CSS-based dark mode extension for Firefox. One toggle, one stylesheet, no background processing.

**A lightweight extension with no unnecessary background processing.**

> Designed for users who prefer minimal overhead over perfect visual accuracy.

---

## How it works

This extension takes a different approach from most dark mode tools. Rather than parsing stylesheets or watching the DOM for changes, it injects a single CSS `filter: invert(1) hue-rotate(180deg)` rule. The browser's GPU compositor handles the rendering. No continuous DOM observation or runtime processing is used after injection.

Images and videos are re-inverted to restore their original colors. That's the entire implementation.

---

## Permissions

The extension requests three permissions:

- `activeTab` - to inject the CSS stylesheet into the current tab
- `storage` - to remember your per-site toggle preference
- `tabs` - to read the current tab's hostname

No network requests are made. No analytics. No data collection of any kind.

**Why `<all_urls>` in content scripts?**
Dark mode is a global visual overlay and must work on any page the user opens. This is standard for extensions of this type.

---

## Install

Firefox Add-ons (AMO): _(link added after publishing)_

### Load manually for testing

1. Go to `about:debugging` in Firefox
2. Click **This Firefox**
3. Click **Load Temporary Add-on...**
4. Select `manifest.json` from the extracted folder

Temporary add-ons are removed on restart. Use the AMO link for persistent install.

---

## Is this safe?

Every line of code is in this repository. The full extension is:

```
manifest.json       - permission declarations
content.js          - injects / removes one CSS file, heuristic dark detection
background.js       - persists per-domain toggle state via storage
styles/dark.css     - 3 CSS rules
popup/popup.html    - toggle UI
popup/popup.js      - UI logic with debounce guard
```

The dark page detection is **heuristic-based** - it samples the computed background color of `<html>` and `<body>`. Works reliably for most static sites. May not detect dark-themed SPAs correctly.

---

## Architecture notes

- CSS injection only - single source of truth, no parallel JS styling logic
- Debounce guard in popup prevents state desync from rapid toggling
- Content script re-injection on demand - handles pages where the script wasn't ready on message send
- No `MutationObserver`, no `setInterval`, no style recalculation loop

---

## License

MIT
