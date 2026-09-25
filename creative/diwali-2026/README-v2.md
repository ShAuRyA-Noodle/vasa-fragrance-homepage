# VASA Diwali film — continuity-safe handoff

The original ten-shot 20-second prompt asked the generator to rebuild the room and four bottle identities too often. That can make a bottle vanish or change its label. Use the **v2 locked prompt** for one Higgsfield generation, or the **v2 production cuts** if identity drift continues.

## One 20-second generation

1. Open Higgsfield → Video → Seedance 2.5 Reference-to-Video.
2. Set 20 seconds, 16:9, and audio off. Use the highest resolution offered in your account.
3. Upload only these six references, in order:
   1. `frames/09-four-fragrances-one-house.png`
   2. `identity-and-product-anchors/original-silent-storm.png`
   3. `identity-and-product-anchors/original-the-sweetest-stranger.png`
   4. `identity-and-product-anchors/original-rebel-in-velvet.png`
   5. `identity-and-product-anchors/original-the-night-lingers.png`
   6. `identity-and-product-anchors/model-identity-batra.jpg`
4. Paste the contents of `seedance-locked-paste-this-v2.txt`, or copy the `copy_paste_prompt` value from `seedance-2.5-diwali-20s-locked-v2.json`. The JSON object itself is a production document, not a Higgsfield form schema.
5. Check the output at 00.0, 05.0, 10.0, 15.0 and 19.9 seconds: count four bottles and confirm unchanged order, geometry and labels. Reject the generation if any bottle vanishes or changes identity. One generation cannot guarantee this through prompt wording alone.

The single-take version deliberately keeps all four bottles in frame for the full 20 seconds. Reflections and focus provide variation; it does not ask Seedance to cut between locations.

## If the model still changes a bottle

Use `seedance-2.5-diwali-production-cuts-v2.json`. It gives **five separate 5-second prompts**: one for each real bottle, then one actress/diya ritual with no bottle. Upload exactly the two named references for each prompt. Each product clip is generated independently so the model has only one bottle identity to maintain.

The JSON's `assembly.segments` gives exact in/out points for a 20.0-second final edit. Use straight cuts, not dissolves between differently labeled bottles. The opening and ending each use the **same original frame 09 pixels**, so the 20.0-to-00.0 website loop boundary is identical. Fix any warped labels in post with the original product image; no text prompt can guarantee pixel-perfect small typography.

All nine storyboard stills remain in `diwali-higgsfield-9-references.zip` for art direction, but uploading all nine into the single-pass v2 run adds conflicting product/location cues. The six named references above are the controlled input set.
