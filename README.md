# VSMD

A VS Code extension to render Markdown files as HTML.

## Features

- One-click Preview - Click the markdown icon in editor title bar to toggle preview
- Syntax Highlighting - Code blocks highlighted with highlight.js
- Dark/Light Mode - Automatically follows VSCode theme, or manually override
- Theme Customization - Support custom CSS themes

## Quick Start

1. Open a Markdown (.md) file
2. Click the markdown icon in the editor title bar
3. Preview appears in a side panel

## Theme Customization

Custom themes are stored in the `themes/` directory. Each theme is a directory containing:

- `vsmd.json` - Theme metadata (name, css filename, image filename, description)
- `theme.css` - Theme styles
- `preview.jpg` or `preview.png` - Theme preview image

Use the `.vsmd-content-inner` selector to target markdown content:

```css
.vsmd-content-inner h1 {
  font-size: 2rem;
  color: #569cd6;
}
```

## License

MIT
