# Human-Centric Vision Demos

Interactive research demos for **Controllable and Structure-Aware Human-Centric Image Synthesis**, organized across three visual scales:

## [Open the live research demos →](https://ling27.github.io/human-centric-vision-demos/)

- **Body — HRHuman:** tuning-free higher-resolution human image generation with human template knowledge.
- **Face — FaceComposer:** reference-based facial component transfer with coherent source context.
- **Skin — Facial Pore Simulation:** realistic short-term pore change visualization based on clinical observations.

The landing page connects the three projects through one thesis question: how can synthesis make controlled changes while preserving the human-specific priors that matter at each scale?

## View locally

From the repository root:

```bash
python3 -m http.server 4172
```

Then open `http://127.0.0.1:4172/`.

## Structure

```text
.
├── index.html                 # Thesis-level entry point
├── HRHuman/                   # Body-level generation demo
├── faceComposer/              # Face-level composition demo
└── FacialPoreSimulation/      # Skin-level simulation demo
```

Each demo is a standalone static page implemented with HTML, CSS, and JavaScript.

## Author

Ling Li
