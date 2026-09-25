#!/usr/bin/env python3
"""Build the nine-frame Higgsfield reference pack from a reviewed manifest.

Usage: python3 build_reference_pack.py manifest.json
The source artwork is never modified. Each frame is copied without re-encoding;
the contact sheet alone is resized for convenient review.
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
FRAMES = ROOT / "frames"
ANCHORS = ROOT / "identity-and-product-anchors"
SHEET = ROOT / "diwali-reference-contact-sheet.jpg"
ARCHIVE = ROOT / "diwali-higgsfield-9-references.zip"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main(manifest_path: Path) -> None:
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    frames = data.get("frames", [])
    if len(frames) != 9:
        raise SystemExit(f"Expected exactly 9 storyboard frames; found {len(frames)}")

    FRAMES.mkdir(parents=True, exist_ok=True)
    resolved: list[tuple[Path, str, str]] = []
    for number, item in enumerate(frames, start=1):
        source = Path(item["source"]).expanduser().resolve()
        if not source.is_file():
            raise SystemExit(f"Missing source frame {number}: {source}")
        try:
            with Image.open(source) as check:
                check.verify()
        except Exception as exc:
            raise SystemExit(f"Invalid source frame {number}: {source}: {exc}") from exc
        dest = FRAMES / f"{number:02d}-{item['slug']}{source.suffix.lower()}"
        shutil.copy2(source, dest)
        resolved.append((dest, item["title"], item.get("note", "")))

    ANCHORS.mkdir(parents=True, exist_ok=True)
    anchor_paths: list[Path] = []
    for item in data.get("anchors", []):
        source = Path(item["source"]).expanduser().resolve()
        if not source.is_file():
            raise SystemExit(f"Missing original anchor: {source}")
        dest = ANCHORS / f"{item['slug']}{source.suffix.lower()}"
        shutil.copy2(source, dest)
        anchor_paths.append(dest)

    canvas = Image.new("RGB", (2400, 1950), "#f4efe7")
    draw = ImageDraw.Draw(canvas)
    draw.text((96, 62), "VASA  /  DIWALI CAMPAIGN", fill="#521528", font=font(53, True))
    draw.text((96, 132), "NINE REFERENCE FRAMES  ·  20-SECOND LOOP", fill="#55494b", font=font(25))
    draw.line((96, 182, 2304, 182), fill="#bda9a0", width=2)

    cell_w, cell_h, gap = 704, 496, 48
    start_x, start_y = 96, 236
    for index, (path, title, note) in enumerate(resolved):
        col, row = index % 3, index // 3
        x, y = start_x + col * (cell_w + gap), start_y + row * (cell_h + gap)
        draw.rounded_rectangle((x, y, x + cell_w, y + cell_h), radius=8, fill="#fffdfa")
        with Image.open(path) as source:
            image = ImageOps.contain(source.convert("RGB"), (cell_w - 24, 382), Image.Resampling.LANCZOS)
            canvas.paste(image, (x + (cell_w - image.width) // 2, y + 10 + (382 - image.height) // 2))
        draw.text((x + 24, y + 410), f"{index + 1:02d}  {title}", fill="#341b24", font=font(28, True))
        if note:
            draw.text((x + 24, y + 450), note[:55], fill="#706465", font=font(20))

    draw.line((96, 1870, 2304, 1870), fill="#bda9a0", width=2)
    draw.text((96, 1890), "Creative direction reference. Preserve actual product label and bottle geometry.", fill="#706465", font=font(18))
    canvas.save(SHEET, "JPEG", quality=92, optimize=True)

    with ZipFile(ARCHIVE, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
        for path, _, _ in resolved:
            archive.write(path, f"references/{path.name}")
        for path in anchor_paths:
            archive.write(path, f"identity-and-product-anchors/{path.name}")
        archive.write(SHEET, SHEET.name)
        archive.write(manifest_path, "manifest.json")

    print(f"Saved {len(resolved)} original frames to {FRAMES}")
    print(f"Copied {len(anchor_paths)} authoritative product/model anchors to {ANCHORS}")
    print(f"Contact sheet: {SHEET}")
    print(f"Upload archive: {ARCHIVE}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 build_reference_pack.py manifest.json")
    main(Path(sys.argv[1]).expanduser().resolve())
