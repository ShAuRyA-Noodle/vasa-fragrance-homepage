# VASA Diwali film — Higgsfield handoff

**Use [README-v2.md](./README-v2.md) and the v2 locked prompt for new generations.** The original prompt below is retained for history; its ten scene changes caused bottle and label continuity problems in testing.

Use [seedance-2.5-diwali-20s.json](./seedance-2.5-diwali-20s.json) as the creative master. It is valid JSON, but the Higgsfield website's Prompt box expects the **value of `copy_paste_prompt`**, not the entire JSON object. The rest of the file records settings and upload roles.

1. Open Higgsfield → Video → **Seedance 2.5 Reference-to-Video**.
2. Set **20 seconds**, **16:9**, **1080p if your plan offers it** (otherwise 720p), and audio on. The current Higgsfield guide says this model supports 4–30 seconds and up to 50 references. These controls and available resolution can vary by plan.
3. Add the **nine new storyboard stills as references 01–09** in scene order. Then add `Batra Model.jpg` as reference 10, followed by the four original VASA bottle packshots as references 11–14 in this order: The Night Lingers, Silent Storm, The Sweetest Stranger, Rebel in Velvet. The storyboard stills establish staging; the model sheet establishes identity; original packshots override generated bottle details. In particular, frame 01 is the unlit brass diya on rosewood with The Night Lingers bottle at right, and the final frame must return to that same composition.
4. Paste only the `copy_paste_prompt` text into the Prompt box. Keep the `REFERENCE MAP` section and exact timings. Generate a short 720p proof first if credits matter, then use the same prompt for the final 20-second run.
5. Inspect at 00:06–08, 00:10–12, 00:12–14, and 00:14–16 to ensure every bottle is distinct, uncropped and correctly labeled. Then compare 00:00.0 with 00:20.0 and listen across the loop seam. If label glyphs warp, use Higgsfield region edit or a post-production label composite from the original packshot; the prompt alone cannot guarantee exact typography.

The supplied YouTube link resolves to Rachit Singh's **“How I Make AI Product Ads That Brands Actually Pay For”**, a workflow tutorial. It is treated as a quality and production-process reference, not as a Diwali shot-for-shot visual reference.

Official model information: [Higgsfield Seedance help](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-seedance), [Higgsfield prompting guide](https://higgsfield.ai/blog/seedance-2-5-prompting-guide).

## Files in this handoff

- `frames/`: nine numbered 16:9 storyboard stills in upload order. These establish the scene, actions, camera and lighting.
- `identity-and-product-anchors/`: the user's Batra model sheet and all four original VASA packshots. These are **brand-authoritative** for the actor identity, precise labels, caps, glass and liquid colours.
- `diwali-reference-contact-sheet.jpg`: a single visual overview for the team.
- `diwali-higgsfield-9-references.zip`: the nine storyboards, five anchors, contact sheet and source manifest together.
- `manifest.json`: exact source provenance and intended role of each image.

Source images were copied without recompression or edits. To rebuild the pack after changing a mapping, run `python3 build_reference_pack.py manifest.json` from this folder.
