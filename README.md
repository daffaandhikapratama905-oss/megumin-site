# Megumin fan page

```
megumin-site/
├── index.html     markup
├── style.css      all styles (colour tokens are at the top)
├── script.js      animations, explosion charge-and-release, scroll reveal
└── src/
    ├── megumin-standing.png
    └── megumin-lying.png
```

## Run it
- **VS Code:** install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.
- Or just double-click `index.html`. Image paths are relative, so it works from disk.

Fonts (Montserrat, Noto Sans JP) load from Google Fonts, so you need an internet connection for them.

## Quick customizing
- Accent colour: `--red` in `:root` at the top of `style.css`.
- Swap art: replace the files in `src/` (keep the names, or update the two `url()` paths and the `--arm` / `--arl` aspect ratios at the top of `style.css`).
- Text: edit `index.html` directly.
