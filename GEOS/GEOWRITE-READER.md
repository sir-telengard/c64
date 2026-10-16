# geoWrite plain-text reader evidence

## Scope

Read GEOS type 7 VLIR documents whose information-sector class is `Write Image V2.0` or `Write Image V2.1`. This reads document data in JavaScript; it does not execute geoWrite or emulate the CPU. Fonts, styles, rulers, pagination layout, embedded graphics and editing are outside this change. The browser's read-only textarea supplies text selection, scrolling and copy.

## References

- Michael Steil's primary reverse-engineering account, [Inside geoWrite: File Format and Pagination](https://www.pagetable.com/242), defines the page record range, header/footer records, text escapes and start-page field.
- [GEOS Programmer's Reference Guide](https://www.zimmers.net/anonftp/pub/cbm/geos/programming/documents/geostechref.html) defines the disk and VLIR chain structures.
- [Collette Utilities archive](https://www.zimmers.net/anonftp/pub/cbm/geos/util/ColletteUtils_d64.zip) supplies public historical document data used for local smoke checks. Downloaded 2026-10-16 into `GEOS/research/`; neither the archive, disk images nor decoded texts are published or committed with this feature.

REA's previously observed Windows-provider boundary excludes these raw 6502/D64 targets. No repeated unsupported REA open was attempted. Findings below come from ordinary binary inspection, format references and Node execution of the JavaScript decoder. They are not REA Evidence and do not establish behavior observed in an original running geoWrite instance.

## Observations

- The two user-supplied images, `GEOS Boot Disk.d64` and `GEOWrite.d64`, have no type 7 documents in their parsed directories. This is a bounded finding about those images, not all GEOS disks.
- `collette.s1.d64` contains nine supported documents; `collette.s2.d64` contains seventeen. All 26 decode to nonempty text with no unsupported-character or omitted-picture warnings. One multipage smoke case is `Font Editor.doc`, which yields eight page sections. These checks confirm extraction, not a visual comparison with original geoWrite rendering or exhaustive proof of text fidelity.
- Public archive SHA-256: `9ba35c6012c18733ae0670cad3779867ca77ed51118b9d828c29218082a5f303`.
- Side 1 SHA-256: `20efd55b76cc6e6e5e0cb839bdfeed8a165f79f6881dd907f79af2dcc3632ee8`.
- Side 2 SHA-256: `96c6f131d3bbda515fa117688606eea0254206842a4defe34aa4b3ca52f87813`.

## Decoder rules

The D64 parser retains directory start/info track-sector pointers. Opening a supported document reads its info sector and VLIR index without changing disk bytes or browser storage. Index bytes 0/1 must be 0/255; record pointers start at byte 2. A 0/255 pointer means unused; 0/0 ends the table. Records 0–60 become numbered page sections using the little-endian start-page number at info offset 137. Records 61 and 62 become separate Header and Footer sections. Reserved/image records 63–126 are never treated as text. Gaps between populated page records produce warnings.

Each text record follows linked 256-byte sectors, removing their two-byte links. The last sector contributes byte-1 minus one payload bytes, including the full 254-byte case. Bounds, repeated/overlapping sectors, overlaps with the BAM/directory/index/info sectors, invalid final lengths and non-success error-table bytes on required sectors prevent opening the document. Extraction fails as a whole instead of presenting earlier pages as a complete document.

The text decoder preserves ASCII 32–126, tab and carriage-return line breaks. A NUL ends the current record's text. A form feed becomes a visible page-break marker. It consumes 27-byte ruler escapes and 4-byte font/style escapes without exposing their payload as text. A 5-byte graphics escape becomes a picture-omitted placeholder without reading its image record. Truncated escapes fail decoding. Other bytes become replacement characters with a warning; custom font glyph mappings and international variants are not reconstructed.

Prev/Next navigates the extracted sections. Details explains the plain-text scope and lists decoding warnings. Export downloads all sections with explicit headings as UTF-8 `.txt`. Closing restores focus to the selected disk file. The original D64 Export still downloads its unchanged image bytes. Unsupported versions, geoPublish documents, programs and other native files retain the metadata-only behavior.

## Reproduction

Run `node --check script.js` and `node --test tests/geos-*.test.cjs`. On this workspace all 88 tests pass; four optional artifact checks skip on a clean checkout lacking the two supplied and two public research images. Twelve new synthetic tests cover versions, sections, formatting, cross-sector escapes, full final sectors, malformed records, unknown characters, images, error tables, unsupported files, UI navigation/export, read-only storage behavior, error dialogs and asynchronous image reads. Two additional smoke tests cover the 26 historical documents.

The synthetic fixture generator is `tests/helpers/geowrite-fixture.cjs`. To create a local test disk: `node -e "require('fs').writeFileSync('GEOS/research/geoWrite-reader-demo.d64',require('./tests/helpers/geowrite-fixture.cjs').fixture().bytes)"`. It is a constructed test image, not an original GEOS-created document or evidence of native compatibility.

Manual acceptance: open `GEOS/research/collette.s1.d64` through disk > open D64, double-click `Font Editor.doc`, advance through pages, inspect Details, export text and Close. Choose Web disk and reopen an existing note or picture. Browser layout and native picker/download behavior still require manual verification.
