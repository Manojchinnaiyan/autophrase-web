# /downloads/

Static files served at `https://<site>/downloads/*`.

## autophrase.zip

The packaged Chrome extension that the dashboard links to via
`/downloads/autophrase.zip`. Rebuild it whenever the extension ships a new
release:

```bash
cd ../../autophrase            # or wherever the extension lives
npm run build && (cd dist && zip -r ../../autophrase-web/public/downloads/autophrase.zip .)
```

Bump `EXTENSION_VERSION` in `src/components/ExtensionPanel.tsx` to match the
extension's manifest version so the dashboard advertises the right number.
