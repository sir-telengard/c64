# GEOS 2.0 easter egg

At the BASIC prompt, enter `LOAD "GEOS",8,1`. Case and spaces around arguments are accepted. GEOS is intentionally absent from the BASIC disk listing.

The command shows SEARCHING / FOUND / LOADING in readable stages and opens a browser recreation of the English GEOS 64 2.0 deskTop after 3.6 seconds. No RUN is required for this easter egg. Reduced motion does not skip the static loading messages. Escape cancels loading.

## Included

- A fixed 320 x 200 bitmap desktop, proportional bitmap lettering, patterned background, fixed disk pad, eight files per page, folded page corner, disk drive and waste basket.
- All seven menu headings; icon and list views sorted by name, size, type or synthetic disk order/date.
- Single-click selection, Shift-click multiple selection, double-click or Enter to open, file information, rename, duplicate, protected system files, reversible deletion, disk open/close/rename/info and validation feedback.
- GEOS and deskTop information, shortcuts, input/printer information, configuration information, desktop pattern switching, calculator, current-time clock and editable Note Pad.
- Open dispatch uses explicit GEOS file types and a browser application registry. READ ME is a document associated with TEXT READER, which displays its full text in a scrollable, read-only window. Multiple selection is rejected by Open. System files and drivers report that they cannot be opened from deskTop; missing document applications offer Retry and Cancel. Page, view, disk and selection are restored when an application closes.
- The virtual disk saves automatically in this browser: file and disk names, copies, trash, file metadata/associations, desktop pattern, and Note Pad content survive page reloads. Each Note Pad accessory file owns its text, so copies can be edited independently. Existing BASIC saved programs use their original storage keys.
- disk > export downloads a JSON backup; disk > import opens a file picker and previews a validated backup before replacement. disk > previous disk offers the previous saved snapshot using the same preview. The disk retains one waste basket file and reserves its space so it can always be restored.
- file > new text creates a named plain-text document through Note Pad. The scratch Note Pad also has New and Save as controls. Named documents have explicit Save, Export (.txt), New, and Close controls; double-clicking their disk icons reopens them for editing. Ctrl/Cmd+S saves. Unsaved changes are checked on Close, New, return to BASIC, and browser reload/close.
- Tab / Shift+Tab and arrow keys move among controls; Enter / Space activate them; Page Up / Down turn disk pages. F1 opens shortcuts. Escape closes a menu/dialog or offers to return to BASIC. Alt+B offers to return to BASIC. The options > BASIC and file > quit commands do the same.
- BASIC input, paste handling and the maze screensaver are suspended throughout GEOS loading and use. Leaving restores the original prompt, BASIC program and colors, and restarts the idle timer.

## Scope and fidelity

This is an independently implemented web desktop, not a C64 emulator or a port of the GEOS kernel. It does not execute original GEOS applications or mount D64 images. geoWrite and geoPaint are not included. Font glyphs and icons are drawn for this recreation rather than copied from GEOS binaries. The sample disk contents and accessory dialogs are representative, not an exact distribution-disk image. Disk persistence is local to the current browser profile and origin; JSON export/import provides portable backups. Clearing browser site data removes local saves.

To keep the initial implementation bounded, hardware-related commands report the simulated configuration. Validate reports the simulated disk state. The clock shows the browser's local clock and has no alarm scheduling. Preference Manager shows available input/display controls; Pad Color Manager changes the desktop pattern. There is no hardware formatting, printing, file dragging or original disk I/O. List views use synthetic file metadata; by date follows the original sample disk order. The waste basket holds one file; moving another there restores the previous file to the simulated disk, so this easter egg never permanently removes a bundled file.

The Open dispatch follows the static investigation documented in [GEOS/OPEN-WORKFLOW.md](GEOS/OPEN-WORKFLOW.md). Browser application IDs, the sample TEXT READER association, case-insensitive filename lookup, Retry wording, and desktop-context restoration are implementation choices. Original GEOS binary applications and legacy PRG execution remain unsupported. Missing-application Retry checks the current virtual disk again; there is no D64 mounting UI. JSON backups are specific to this browser recreation. File icons do not determine application behavior. The local research disk images and extracted code are not website assets.

## Plain-text documents

Use file > new text, type, click Save, and enter a unique name of up to 16 characters. The saved file is selected and brought into view when the editor closes. Double-click it to reopen, edit, and Save or press Ctrl/Cmd+S. file > duplicate creates an independently editable copy with a distinct generated name. Changes to a named document are drafts until saved; the asterisk and status line indicate unsaved changes. New, Close, and return to BASIC offer Save, Discard, and Cancel when needed. The browser's reload/close warning is requested for unsaved text. Protected documents open read-only.

The original scratch Note Pad still autosaves its own text. Its New button starts a blank document; Save as copies the scratch text into a named document without changing the scratch note. Named documents associate with the current Note Pad filename on the same virtual disk, so renaming or removing that accessory can require restoring its name before a document will open. Allowing this browser Note Pad accessory to act as a document application is an intentional extension to the original GEOS file-type dispatch, not recovered original behavior. READ ME continues to open read-only in TEXT READER. Existing disk saves need no schema upgrade or reset.

Document sizes are recalculated from UTF-8 text when saved, within the virtual disk's capacity. A full disk, blocked storage, or conflicting saved disk leaves the draft open and the previous saved document unchanged; Export downloads the draft as a plain `.txt` file for recovery. Disk JSON export includes saved document contents and associations, not unsaved editor drafts. Formatting and original geoWrite documents are not implemented.

## Disk storage and recovery

The `c64-geos-disk` localStorage key contains a `geos-web-disk` version 2 snapshot with disk identity/name/pattern, file records, and a nullable waste basket file ID. Note Pad text is the accessory file's `content`; documents retain their text and parent-application association. The first save migrates text from the old `c64-geos-note` key without deleting or updating that legacy key. Version 1 disk snapshots are upgraded by moving their optional top-level `note` into the Note Pad file, with a missing pattern and trash ID defaulting to zero and null. Original version 1 bytes are retained as the previous snapshot.

Each successful change retains the previous saved snapshot in `c64-geos-disk-backup`; this is one rotating snapshot, not full history. Import keeps the current in-memory disk as that backup before writing the replacement. Invalid import files do not change the disk. Confirmation is canceled if another tab has changed the saved disk; reload before importing again. Import accepts only the supported schema, unique file IDs, valid text/metadata, and the simulated 165-Kbyte capacity, including the trash reservation. It does not execute content from a backup.

If the main save is corrupt or from a newer unsupported version, a readable previous snapshot is loaded when available, and automatic writes are blocked to preserve the original bytes. Use disk > previous disk to review and explicitly restore that snapshot, or import a known backup. Replacing an unreadable/newer primary save also preserves its raw bytes in `c64-geos-disk-recovery`. This recovery key is for manual recovery with a compatible future version. If both saved copies are unreadable, the supplied sample disk is shown in session mode and both saved copies remain unchanged.

Storage denial, quota failures, and conflicting tabs leave the current session usable. The desktop shows `session only`, Note Pad reports its save status, and disk > info gives the reason. Export remains available for session data. An import that cannot be saved leaves the current disk unchanged. Disk saves do not include BASIC programs, browser history, open application state, or page/view/selection across full reloads. App close/return still preserves its desktop context within the current session.

## References and attribution

- [mist64/geos](https://github.com/mist64/geos): GEOS kernel organization, native display dimensions and application model; reverse-engineering work by Maciej Witkowiak and Michael Steil. No assembly, font data, ROM or disk images are bundled or translated from that repository.
- [GEOS 2.0 screenshots at GUIdebook](https://guidebookgallery.org/screenshots/geosc64/): deskTop geometry, menu structure, page-turning model and desk accessory references. Screenshots are references only, not shipped assets.
- [Commodore GEOS Resource Centre](https://tierceron.com/commodore/geos/first.php): boot disk and disk-page workflow references.

GEOS was developed by Berkeley Softworks. Original names identify the historical software being recreated. This project does not claim to be an official release.

## Files and deployment

Serve the existing repository as static files. GEOS code is included at the beginning of `script.js`, before the BASIC interpreter, and its styles are included in `styles.css`. This keeps deployment on the existing asset URLs and avoids missing standalone GEOS assets. The BASIC command handler includes the GEOS command branch and a guard in its idle-timer reset. `wrangler.jsonc` configures static asset deployment to the existing `jasonstum-homepage` Worker; `.assetsignore` limits publication to the website files. No packages, build step, server or external runtime requests are needed.

For review, open the site, issue the command, explore both file pages and menus, close/reopen the disk, try the calculator and Note Pad, then return to BASIC and run an existing BASIC program. Confirm that an unrelated LOAD still follows the original behavior.

## Original implementation validation

JavaScript syntax checks passed before and after consolidating the scripts. Browser checks passed for exact and lowercase/spaced LOAD commands, loading cancellation, both disk pages, menu selection and GEOS information, icon and name-list views, disk close/reopen, calculator arithmetic (2 + 3 = 5), Note Pad paste isolation, keyboard opening and rename submission, deletion/restoration, return to BASIC, preservation/execution of a previously entered BASIC program, and an unrelated missing-file LOAD. The GEOS desktop fit a 390 x 844 viewport. No browser JavaScript errors were observed during these checks.

## Open workflow validation

Run `node --test tests/geos-open.test.cjs` and `node --check script.js`. The 12 tests execute the production GEOS closure with a DOM/canvas substitute. They cover type-based application and accessory dispatch, multi-selection rejection, document association and complete reader content, double-click across button redraws in both views, Enter/Escape and focus restoration, missing/renamed/wrong-disk parent applications, retry/cancel, unsupported types, unknown applications, Note Pad storage isolation, and unavailable files. These tests do not verify browser layout or establish parity with original GEOS runtime behavior.

## Persistence validation

Run `node --test tests/geos-open.test.cjs tests/geos-storage.test.cjs`. All 28 tests cover the Open workflow plus fresh-page save/reload, trash restoration, disk name/pattern and association persistence, legacy Note Pad migration, version 1 upgrades, corrupt/newer snapshots and recovery, storage denial and quotas, conflicting tabs (including import confirmation), independent copied notes, downloadable JSON round trips, import cancellation/validation/write failures, late asynchronous file reads after returning to BASIC, and capacity reserved for trash restoration. The shared harness supplies DOM/canvas/storage substitutes; actual browser download/file-picker behavior and original GEOS runtime parity are not established by these tests.

`node --test tests/geos-boot.test.cjs tests/geos-open.test.cjs tests/geos-storage.test.cjs` runs all 31 checks. The boot checks use a controllable clock to verify that SEARCHING, FOUND, and LOADING precede desktop activation with either motion preference, and that Escape cancels pending stages.

## Document editor validation

Run `node --test tests/geos-boot.test.cjs tests/geos-open.test.cjs tests/geos-storage.test.cjs tests/geos-editor.test.cjs` for all 45 checks. The 14 editor checks cover named creation/reload/reopen, draft versus saved content, keyboard save, scratch Save as and cancellation, duplicate/blank names, Save/Discard/Cancel and unnamed save-on-close, New/BASIC exit, independent copies and JSON round trips, unique repeated copy names, failed saves and draft text export, disk capacity, UTF-8 sizing, protected files, unload handling, and modal Tab focus. DOM/canvas substitutes do not establish actual browser layout, download dialogs, or native reload-warning presentation.
