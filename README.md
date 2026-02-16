# Multi Tag Delete plugin for Inkdrop

Bulk delete multiple tags at once in [Inkdrop](https://www.inkdrop.app/), including removing those tags from any notes that use them. Also supports one-click selection of unused (orphan) tags for quick cleanup.

## Features

- View all tags with note counts and colour indicators
- Select multiple tags via checkboxes
- **Select Unused** button to auto-select all tags with 0 notes
- Confirmation prompt before deletion showing tag and note counts
- Tags are fully removed from notes on deletion

## Install

```
ipm install multi-tag-delete
```

## Usage

Open the dialog via:

- **Menu**: Plugins > Multi Tag Delete > Toggle
- **Keyboard**: `Ctrl+Alt+Shift+D`
- **Command palette**: `multi-tag-delete:toggle`

From the dialog:

1. Select tags manually using checkboxes, or click **Select Unused** to auto-select orphan tags
2. Click **Delete Selected**
3. Confirm the deletion in the prompt

## Development

```bash
git clone https://github.com/worzeel/inkdrop-multi-tag-delete.git
cd inkdrop-multi-tag-delete
ipm link --dev
```

Enable **Developer Mode** in Inkdrop settings, then reload (`Alt+Cmd+Shift+R` on macOS).

## License

[MIT](LICENSE)
