# geoWrite reader evidence

## Scope

Read GEOS type 7 VLIR documents whose information-sector class is `Write Image V2.0` or `Write Image V2.1`. This reads document data in JavaScript; it does not execute geoWrite or emulate the CPU. Bold, italic, underline and the encoded point size are rendered in a selectable, scrollable read-only document region. A generic browser font approximates glyphs. Monochrome embedded pictures are decoded from referenced Photo Scrap records. Paragraph alignment, margins and first-line/hanging indentation are approximated from rulers. Pagination layout, custom tab stops, line spacing, reverse, outline, superscript, subscript, color and editing remain outside this change.

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

The text decoder preserves ASCII 32–126, tab and carriage-return line breaks. A NUL ends the current record's text. A form feed becomes a visible page-break marker. It consumes 27-byte ruler escapes into paragraph metadata without exposing their payload as text. Four-byte font/style escapes update the state used for subsequent text runs: the little-endian font word has size in bits 0–5 and font ID in bits 6–15; style bits 6, 4 and 7 select bold, italic and underline respectively. Each record starts with fresh defaults and its own escapes establish the page style. Consecutive text with the same settings is grouped into a run. Plain extracted text is retained separately for export. A 5-byte graphics escape creates an image reference carrying dimensions and a VLIR record number. Its text-export representation remains a picture-omitted marker. Truncated escapes fail decoding. Other bytes become replacement characters with a warning; custom font glyph mappings and international variants are not reconstructed.

Prev/Next navigates the extracted sections. Details explains the formatting scope and lists decoding warnings. Export downloads all sections with explicit headings as UTF-8 `.txt`. Closing restores focus to the selected disk file. The original D64 Export still downloads its unchanged image bytes. Unsupported versions, geoPublish documents, programs and other native files retain the metadata-only behavior.

## Reproduction

Run `node --check script.js` and `node --test tests/geos-*.test.cjs`. On this workspace all 107 tests pass; five optional artifact checks skip on a clean checkout lacking the two supplied and two public research images and the historical Photo Scrap. Twelve new synthetic tests cover versions, sections, formatting, cross-sector escapes, full final sectors, malformed records, unknown characters, images, error tables, unsupported files, UI navigation/export, read-only storage behavior, error dialogs and asynchronous image reads. Two additional smoke tests cover the 26 historical documents.

Four formatting checks additionally cover style combinations/resets, zero-size fallback and the maximum encoded size, page-local style state, literal rendering of HTML-like document text, safe DOM spans, focus/navigation, Details return and plain-text export. Historical document checks verify that joining formatted runs preserves the extracted text; the Font Editor heading is decoded at 18 points with bold set. A local scan of side 1 finds bold, italic and underline runs; both disks contain 9, 10, 12 and 18 point runs. These are decoder observations, not browser visual validation.

The browser displays each supported run as a `span`, populated with `textContent`, with explicit CSS font weight/style/decoration and size. No document HTML is interpreted. A size of one GEOS point is approximated by one CSS pixel before desktop scaling, with zero-size codes falling back to 10 pixels. Original font IDs remain in run metadata but are not resolved to original font bitmaps. The containing region uses a generic Arial/sans-serif font, preserves whitespace and tabs, wraps to its viewer width and scrolls. It has a document role and keyboard focus; it is not contenteditable. Export is still plain UTF-8 text. This is basic formatting fidelity, not original glyph metrics, print layout or native editing.

The synthetic fixture generator is `tests/helpers/geowrite-fixture.cjs`. To create a local test disk: `node -e "require('fs').writeFileSync('GEOS/research/geoWrite-reader-demo.d64',require('./tests/helpers/geowrite-fixture.cjs').fixture().bytes)"`. It is a constructed test image, not an original GEOS-created document or evidence of native compatibility.

Manual acceptance: open `GEOS/research/collette.s1.d64` through disk > open D64, double-click `Font Editor.doc`, advance through pages, inspect Details, export text and Close. Choose Web disk and reopen an existing note or picture. Browser layout and native picker/download behavior still require manual verification.

## Embedded monochrome pictures

The [primary geoWrite copy/paste analysis](https://www.pagetable.com/243) describes the Photo Scrap dimensions and BitmapUp compression. The local mist64/geos reference's `kernal/graph/bitmapup.s` also provides the original decoder's structure. This implementation reads the three-byte width/height header, then repeat, literal and bigcount packets. Bigcount patterns contain repeat/literal packets; nested/reserved packet codes and incomplete packets are rejected. It stops after the declared bitmap bytes, ignoring any trailing color stream, as geoWrite is monochrome. Bytes scan left-to-right and top-to-bottom; bit 7 is leftmost and a set bit is black.

The reader resolves only image records explicitly referenced by page/header/footer escapes. References must be 64–126, precede the VLIR end marker and match the Photo Scrap dimensions. Image chains use the same bounds, overlap, cycle and recorded-sector-error checks as text chains. Successful images are cached per record. A failed picture leaves the remaining document readable, displays the text placeholder and records its reason in Details. Limits are 1,048,576 pixels per image and 4,194,304 displayed picture pixels per document, counting repeated placements. Unsupported or oversized images fall back to placeholders.

The read-only DOM inserts a canvas at each successful image run between its neighboring text runs. Canvas pixel bytes explicitly set black/white and full opacity. Images preserve their aspect ratio and shrink to the available width; they are not printed at original GEOS coordinates or cropped to the original page margins. Each canvas has an image role and a dimension label. Plain-text export keeps picture-omitted markers, and the original D64 export still returns unmodified bytes.

The 26 existing Collette geoWrite documents have no picture escapes. For an independent historical bitmap, the public [geoPublish archive](https://www.zimmers.net/anonftp/pub/cbm/geos/productivity/GeoPublish_d64.zip) was downloaded locally on 2026-10-16. Its `geopub_d1s1.d64` contains a sequential `Photo Scrap`, beginning at track 2/sector 2, whose 2,662-byte payload was extracted without executing software. It decodes to a recognizable monochrome building at 216 × 144 pixels. A separately written Python expanded-stream decoder agrees with all 3,888 bitmap bytes, and a PNG made from the decoded bits was visually inspected. This verifies the bitmap data path; it is not browser rendering or native geoWrite runtime evidence.

- Archive SHA-256: `30a17f7cd828684a63eac62794f3b1cd9ec2333aa57feaf63353338f80936a83`.
- Disk SHA-256: `50a34bbc6b6249cf11bb46990cc9ae492256808caf50660b9297b06d81104265`.
- Extracted Photo Scrap SHA-256: `d288d575307547dc51cc3a2fcef3550bdaf9972851c98cb95b43f6f9efc959c3`.
- Decoded bitmap SHA-256: `5e5ede23825cd7393e51cf797531fb5724af47305786402274940f8dc0cbe837`.

`GEOS/research/geoWrite-picture-demo.d64` places this unchanged historical Photo Scrap into a constructed geoWrite test container using `tests/helpers/geowrite-fixture.cjs`. The surrounding page text explicitly identifies it as a constructed test. This does not establish that the document was authored or opened by native geoWrite. Original archives, derived images and the demo remain local research files and are neither committed nor published as website assets.

Nine image checks cover exact reference-rectangle pixels, all supported packet types, malformed/reserved packets and dimensions, ignored color data, canvas/text ordering and RGBA polarity, missing/mismatched references and VLIR end markers, shared records, overlapping/cyclic/error-flagged sectors, resource limits, unchanged storage, plain-text export and the historical bitmap digest. To check live rendering, open `GEOS/research/geoWrite-picture-demo.d64`, double-click READ ME and scroll to the building picture between the text. Confirm Details has no decoding warnings, then return to Web disk. Full paragraph layout and native-runtime comparison remain unverified.

## Paragraph alignment and indentation

The ruler record described by [the primary geoWrite format analysis](https://www.pagetable.com/242) supplies little-endian left/right margins at offsets 1/3, an absolute first-line left position at offset 21, and alignment in the low two bits of offset 23. The reader preserves ruler state across carriage-return paragraph boundaries, with fresh defaults at each page/header/footer. Text styles may change inside a paragraph without losing its ruler. Blank paragraphs are retained. Left, center, right and justified alignment map to CSS paragraph alignment; justification uses the browser's normal last-line handling.

Left/right margins are displayed as percentages of an inferred page width: 640 dots if any valid ruler right margin exceeds 480, otherwise 480. The first-line indent is `(first - left)` relative to the paragraph's usable width, which supports hanging indents when first is less than left. This inference cannot distinguish a wide page whose rulers all stay within 480 dots. Actual wrapping uses the current browser font and available viewer width; original line breaks, line spacing, tab-stop positions and print pagination are not reconstructed.

Coordinates require left < right <= 640 and first < right. Invalid rulers fall back to unindented left alignment and add a warning. A ruler found mid-paragraph applies at the next paragraph boundary with a warning rather than silently changing the existing paragraph. None of these display operations modifies exported text or source disk bytes. Rendered `p` elements remove the final carriage-return newline from their last displayed run to avoid adding a second visual line break; the untouched text/run model retains that newline for export. Blank paragraphs have a minimum line height.

Six additional tests cover all alignments, byte order, ruler persistence, blank paragraphs, mixed styles, invalid/misplaced rulers, proportional regular/wide-page coordinates, hanging indents, page navigation and unchanged plain-text export/storage. All 107 checks pass in this workspace. A local scan of the 26 Collette documents finds 677 left, 21 centered and 185 justified paragraphs, including 70 hanging and 85 first-line indents. Right alignment is covered by the constructed fixture. These counts are decoder observations rather than native layout validation.

For manual acceptance, open `GEOS/research/geoWrite-paragraph-demo.d64`, double-click READ ME, and compare its centered heading, left paragraph, right line, justified text and hanging indent. The demo is independently constructed with the committed test helper and remains local. Reopen `Font Editor.doc` for a historical sample, then return to Web disk and verify existing notes/pictures still open. Browser visual verification and original GEOS layout comparison remain manual.
