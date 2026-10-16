# GEOS 2.0 easter egg

At the BASIC prompt, enter `LOAD "GEOS",8,1`. Case and spaces around arguments are accepted. GEOS is intentionally absent from the BASIC disk listing.

The command shows SEARCHING / FOUND / LOADING and opens a browser recreation of the English GEOS 64 2.0 deskTop. No RUN is required for this easter egg. With reduced motion enabled, the delay is skipped. Escape cancels loading.

## Included

- A fixed 320 x 200 bitmap desktop, proportional bitmap lettering, patterned background, fixed disk pad, eight files per page, folded page corner, disk drive and waste basket.
- All seven menu headings; icon and list views sorted by name, size, type or synthetic disk order/date.
- Single-click selection, Shift-click multiple selection, double-click or Enter to open, file information, rename, duplicate, protected system files, reversible deletion, disk open/close/rename/info and validation feedback.
- GEOS and deskTop information, shortcuts, input/printer information, configuration information, desktop pattern switching, calculator, current-time clock and editable Note Pad.
- Note Pad text is saved under the separate localStorage key `c64-geos-note`. If browser storage is blocked, the note remains available for the current session. Existing BASIC saved programs use their original storage keys.
- Tab / Shift+Tab and arrow keys move among controls; Enter / Space activate them; Page Up / Down turn disk pages. F1 opens shortcuts. Escape closes a menu/dialog or offers to return to BASIC. Alt+B offers to return to BASIC. The options > BASIC and file > quit commands do the same.
- BASIC input, paste handling and the maze screensaver are suspended throughout GEOS loading and use. Leaving restores the original prompt, BASIC program and colors, and restarts the idle timer.

## Scope and fidelity

This is an independently implemented web desktop, not a C64 emulator or a port of the GEOS kernel. It does not execute original GEOS applications or mount D64 images. geoWrite and geoPaint are not included. Font glyphs and icons are drawn for this recreation rather than copied from GEOS binaries. The sample disk contents and accessory dialogs are representative, not an exact distribution-disk image. File/disk edits remain in memory until the page reloads; Note Pad text persists separately.

To keep the initial implementation bounded, hardware-related commands report the simulated configuration. Validate reports the simulated disk state. The clock shows the browser's local clock and has no alarm scheduling. Preference Manager shows available input/display controls; Pad Color Manager changes the desktop pattern. There is no hardware formatting, printing, file dragging or original disk I/O. List views use synthetic file metadata; by date follows the original sample disk order. The waste basket holds one file; moving another there restores the previous file to the simulated disk, so this easter egg never permanently removes a bundled file.

## References and attribution

- [mist64/geos](https://github.com/mist64/geos): GEOS kernel organization, native display dimensions and application model; reverse-engineering work by Maciej Witkowiak and Michael Steil. No assembly, font data, ROM or disk images are bundled or translated from that repository.
- [GEOS 2.0 screenshots at GUIdebook](https://guidebookgallery.org/screenshots/geosc64/): deskTop geometry, menu structure, page-turning model and desk accessory references. Screenshots are references only, not shipped assets.
- [Commodore GEOS Resource Centre](https://tierceron.com/commodore/geos/first.php): boot disk and disk-page workflow references.

GEOS was developed by Berkeley Softworks. Original names identify the historical software being recreated. This project does not claim to be an official release.

## Files and deployment

Serve the existing repository as static files. `index.html` now loads `geos.css` and `geos.js` before the original interpreter. The original BASIC command handler has one new GEOS command branch and a guard in its idle-timer reset. No packages, build step, server or external runtime requests are needed.

For review, open the site, issue the command, explore both file pages and menus, close/reopen the disk, try the calculator and Note Pad, then return to BASIC and run an existing BASIC program. Confirm that an unrelated LOAD still follows the original behavior.

## Validation performed

JavaScript syntax checks passed for both scripts. Browser checks passed for exact and lowercase/spaced LOAD commands, loading cancellation, both disk pages, menu selection and GEOS information, icon and name-list views, disk close/reopen, calculator arithmetic (2 + 3 = 5), Note Pad paste isolation, keyboard opening and rename submission, deletion/restoration, return to BASIC, preservation/execution of a previously entered BASIC program, and an unrelated missing-file LOAD. The GEOS desktop fit a 390 x 844 viewport. No browser JavaScript errors were observed during these checks.
