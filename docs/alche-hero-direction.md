# Alche hero — observed behaviour and VASA adaptation

Reference: https://alche.studio/ (inspected live, 18 September 2026)

## Observed
A large glass triangular A sits in front of oversized typography inside a curved grid environment. The foreground form reflects/refracts its surroundings. After dismissing the sound prompt, scrolling changes the object's orientation and moves the typographic scene from the studio name to Works while the camera-like composition stays continuous. This is a coordinated spatial scene, not a collection of independent CSS reveals.

## VASA direction
- Original sculptural glass V, with warm champagne or amber lighting.
- Large VASA wordmark behind the form, restrained environment without the technical grid.
- Slower rotation, smaller pointer-response amplitude, shorter sequence.
- A single scroll-controlled transition resolves into the actual fragrance collection.
- Product imagery stays fully framed; the hero form is a brand sculpture, not a falsely accurate bottle.
- Mobile uses a lighter scene; reduced-motion mode shows a stable composition and direct collection link.

## Implementation assessment
A close recreation of the motion grammar is feasible with a custom Three.js/WebGL scene and GSAP sequencing. The visual material would be our own implementation; exact parity with Alche's custom shaders/assets is not promised. A glass V can be modelled in code without new user assets. A faithful rotating VASA product requires suitable product geometry, dimensions and label/material references (ideally a GLB/GLTF/CAD model).

This reference arrived while the third edition was under QA. It is a proposed next hero, not included in the third-edition deployment. The user asked for a feasibility assessment before further hero implementation.
