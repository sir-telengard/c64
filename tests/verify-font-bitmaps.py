"""Optional independent FreeType check (requires Pillow and local GEOWrite.d64).

Run: python tests/verify-font-bitmaps.py
The production JS decoder/TTF builder supplies in-memory test data; FreeType
independently rasterizes every glyph to compare with the original bitmap rows.
No source images, fonts or other files are modified.
"""
import base64
import io
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
probe = r"""
const fs=require('fs'),e=require('./tests/helpers/geos-harness.cjs').desktop();
const data=e.api.parseD64(fs.readFileSync('GEOS/GEOWrite.d64')).readFonts();
if(data.warnings.length)throw Error(data.warnings.join('\n'));
process.stdout.write(JSON.stringify(data.fonts.map(f=>({...f,bitmap:Array.from(f.bitmap),ttf:Buffer.from(e.api.geosTrueType(f)).toString('base64')}))));
"""
fonts = json.loads(subprocess.check_output(['node', '-e', probe], cwd=root))
checked = 0
for source in fonts:
    size = source['pointSize']
    font = ImageFont.truetype(io.BytesIO(base64.b64decode(source['ttf'])), size)
    for code in range(32, 127):
        start, end = source['positions'][code - 32:code - 30]
        width = end - start
        assert font.getlength(chr(code)) == width, (source['name'], size, code, 'advance')
        if width:
            image = Image.new('L', (width, size), 255)
            ImageDraw.Draw(image).text((0, source['baseline'] + 1), chr(code), fill=0, font=font, anchor='ls')
            expected = bytes(
                0 if source['bitmap'][y * source['rowBytes'] + (start + x) // 8] & (128 >> ((start + x) % 8)) else 255
                for y in range(size) for x in range(width)
            )
            assert image.tobytes() == expected, (source['name'], size, code, 'bitmap')
        checked += 1
print(f'{len(fonts)} faces, {checked} glyphs: all FreeType pixel masks and advances match.')
