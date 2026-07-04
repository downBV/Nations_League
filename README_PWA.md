# Football Manager 2026 - PWA Telepítési Útmutató

## ✅ Most már telepíthető Android telefonra (standalone app-ként)!

## Szükséges fájlok EGY mappában (GitHub Pages / bármilyen HTTPS szerver)

### Főfájlok
- `index.html` - A játék főfájlja
- `manifest.json` - PWA konfiguráció (app név, ikon, színek)
- `sw.js` - Service Worker (offline működés + cache)

### Menüképek
- `background.png`
- `settings.png`
- `cups.png`
- `about.png`
- `kickoff.png`
- `exit.png`

### Mérkőzés végi képek
- `won.png`
- `lost.png`
- `draw.png`

### PWA ikonok (ÚJ - generálva a feltöltött favicon.png-ből)
- `icon-72.png`
- `icon-96.png`
- `icon-128.png`
- `icon-144.png`
- `icon-152.png`
- `icon-192.png`
- `icon-384.png`
- `icon-512.png`

## 📲 Hogyan telepítik a felhasználók?

### Android Chrome:
1. Megnyitják a weboldalt (pl. `downbv.github.io/Nations_League`)
2. Automatikusan megjelenik egy **"Telepítés a telefonra"** zöld gomb a főmenüben
3. Rákattintanak → Android natív telepítő popup jelenik meg
4. "Telepítés" → az app megjelenik a telefon app fiókjában, mint egy normál alkalmazás!

### Alternatív módszer (ha a gomb nem jelenik meg):
1. Chrome menü (⋮ jobb felül)
2. "Alkalmazás telepítése" vagy "Hozzáadás a kezdőképernyőhöz"

## ⚠️ FONTOS: HTTPS szükséges!

A Service Worker és a PWA telepítés **csak HTTPS-en** működik!
- ✅ GitHub Pages (`*.github.io`) - automatikusan HTTPS
- ✅ Netlify, Vercel - automatikusan HTTPS
- ❌ `file://` protokoll - NEM működik
- ❌ Sima HTTP - NEM működik

## 🎮 Mi történik telepítés után?

- Az app **teljes képernyős módban** fut (nincs Chrome címsor/navigáció)
- Saját ikon jelenik meg a telefon app-fiókjában és kezdőképernyőn
- **Offline is működik** (a Service Worker cache-eli a fájlokat)
- Úgy néz ki és viselkedik, mint egy natív Android app

## 🔄 Frissítés

Ha módosítod az `index.html`-t vagy bármelyik képfájlt:
1. Növeld meg a `sw.js` fájlban a `CACHE_VERSION` értékét (pl. `'fm2026-v1'` → `'fm2026-v2'`)
2. Ez kényszeríti, hogy a felhasználók böngészője letöltse a friss verziót

## Mappastruktúra

```
/weboldal/
  ├── index.html
  ├── manifest.json
  ├── sw.js
  ├── background.png
  ├── settings.png
  ├── cups.png
  ├── about.png
  ├── kickoff.png
  ├── exit.png
  ├── won.png
  ├── lost.png
  ├── draw.png
  ├── icon-72.png
  ├── icon-96.png
  ├── icon-128.png
  ├── icon-144.png
  ├── icon-152.png
  ├── icon-192.png
  ├── icon-384.png
  └── icon-512.png
```
