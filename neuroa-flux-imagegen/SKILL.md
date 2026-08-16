---
name: neuroa-flux-imagegen
description: Generate images through the Neuroa API with the `flux.2-klein-9b` model. Use when Codex needs to create a new image, concept art, marketing visual, icon, thumbnail, product shot, or other still image by calling `https://api.neuroa.me/v1/images/generations`, especially when the user explicitly mentions Neuroa, `flux.2-klein-9b`, or wants a reusable local CLI for prompt-based image generation.
---

# Neuroa Flux Imagegen

Generate still images with Neuroa by running the bundled CLI at `scripts/neuroa_image_gen.py`. Default to `flux.2-klein-9b`, save files locally, and keep prompts concise and production-oriented.

## Quick Start

1. Confirm the request is for a new image, not an edit.
2. Turn the user request into a compact prompt spec: subject, style, framing, lighting, constraints, avoid list.
3. Run `scripts/neuroa_image_gen.py` with the prompt and an explicit output path.
4. Inspect the result if visual quality matters and iterate with one targeted prompt change at a time.

Example:

```powershell
python "C:\Users\me\.codex\skills\neuroa-flux-imagegen\scripts\neuroa_image_gen.py" `
  --prompt "minimal matte-black coffee mug on a cream studio backdrop, soft light, premium product photo, no text" `
  --out "output\neuroa-imagegen\coffee-mug.png"
```

## Workflow

### 1. Decide whether to use this skill

- Use this skill for prompt-to-image generation only.
- Do not use it for inpainting, masking, or multi-image edits; this API workflow only covers `/v1/images/generations`.

### 2. Prepare the prompt

- Keep the prompt short and explicit.
- Include only requested creative details plus necessary composition constraints.
- If the user wants text rendered inside the image, quote it verbatim.
- If the request is broad, format the prompt as:

```text
Subject: ...
Style: ...
Composition: ...
Lighting: ...
Background: ...
Constraints: ...
Avoid: ...
```

### 3. Run the CLI

Use the bundled script instead of rewriting the HTTP call.

Common flags:
- `--prompt`: required prompt text
- `--out`: output image path; parent directories are created automatically
- `--model`: defaults to `flux.2-klein-9b`
- `--size`: optional size such as `1024x1024`
- `--n`: optional image count; defaults to `1`
- `--api-key-env`: defaults to `NEUROA_API_KEY`

### 4. Verify and iterate

- Check that the saved image matches the request before concluding.
- If the result is close but off, change one thing in the prompt and rerun.
- If the API returns an upstream model error for `flux.2-klein-9b`, treat it as a provider-side issue. Tell the user the model is listed in `/v1/models` but the generation endpoint rejected it, then ask before falling back to another model.

## Environment

- Require `NEUROA_API_KEY`.
- Read the key from the environment; never hardcode the key into skill files.
- If the key is missing, stop and tell the user to set it locally.

PowerShell:

```powershell
$env:NEUROA_API_KEY = "..."
```

Persist for the current Windows user:

```powershell
[Environment]::SetEnvironmentVariable("NEUROA_API_KEY", "...", "User")
```

## Output Conventions

- Prefer saving generated images under `output/neuroa-imagegen/` in the current workspace.
- Use stable descriptive filenames based on the asset purpose.
- Keep prompt text out of filenames; use adjacent notes only if needed.

## Reference Map

- `references/api.md`: confirmed endpoint, payload, and response shape notes for Neuroa
- `scripts/neuroa_image_gen.py`: reusable CLI for making the request and downloading the image
