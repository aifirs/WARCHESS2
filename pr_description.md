## What & Why

This PR fixes two issues found during review:

1. Chess engine state exposure: previously the engine exported internal variables (board, selected, validMoves) directly which led to external code reading/writing snapshots that fell out of sync. The engine now exposes accessor methods (getSelected, getValidMoves, clearSelection) and other functions. External code (main.js) was updated to use these APIs.

2. Service worker path: registration used an absolute path `/sw.js` which breaks when the site is hosted on GitHub Pages under `https://<user>.github.io/<repo>/`. The SW registration now uses a relative path `sw.js`.

## Changes
- js/chess_engine.js: export API accessors instead of direct variables
- js/main.js: use engine.getSelected()/getValidMoves()/clearSelection() and register SW with relative path

## Notes
- Please verify manifest.json and sw.js for absolute paths if PWA issues persist.

---

