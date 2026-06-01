# Content Source Contract

## Source

`../portfolio-content` is the authoritative source for project content.

## Structure

```text
portfolio-content/
  GIS Analysis/
  Remote Sensing/
  UAV Mapping/
```

Each area may contain:

- numbered group folders with project folders inside
- numbered project folders directly

The number at the start of a folder controls display priority.

## Project Files

Each project folder should contain:

- `project.md`
- `visual-index.md`
- `images/`

## Generated Fields

Each project becomes:

- `id`
- `title`
- `area`
- `group`
- `priority`
- `status`
- `period`
- `client`
- `location`
- `summary`
- `details`
- `keywords`
- `deliverables`
- `sources`
- `heroImage`
- `gallery`
- `hasOwnImages`
- `visualPending`

## Fallbacks

If a project has no image, it inherits the first available image from its group
or area and receives `visualPending: true`.
