---
name: create-ui
description: Generates new UI from an image. Use this skill when the user attaches a screenshot or mockup and wants to build a matching React component or page.
---

## Steps

### Step 1 — Analyze the image

Examine the attached image carefully. Note the layout, sections, colors, typography, interactive elements, and overall visual structure.

### Step 2 — Ask for context

Ask the user:

> "Before I start, a few quick questions:
>
> 1. What is this component/page called, and what is its purpose?
> 2. Where should the new files live in the project?"

Wait for the user's answers before continuing.

### Step 3 — Confirm requirements

Show the user this requirements list and ask them to confirm or adjust it:

> Here are the default requirements I'll follow. Let me know if you want to change or add anything:
>
> - Match the visual design in the image as closely as possible
> - Use light colors (unless the image shows dark theme)
> - Use Tailwind CSS classes for all styling
> - The UI should be responsive
> - Use `react-guidelines` conventions throughout (component structure, `classes` object, primitive components, etc.)

Wait for confirmation or adjustments before continuing.

### Step 4 — Build the UI

Implement the component(s) following all confirmed requirements and the `react-guidelines` skill. Additionally:

- **File placement:** Create files in the location the user specified in Step 2.
