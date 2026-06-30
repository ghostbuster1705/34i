# Baufinanzierung Berlin — Landing Page

Professionelle Landing Page für **Aleksandr Nikolaev**, Immobiliardarlehensvermittler §34i GewO (Berlin).

## Features

- Responsives Design (Mobile-first)
- Annuitätendarlehen-Rechner mit Echtzeit-Berechnung
- Lead-Formular mit DSGVO-Einwilligung
- SEO: Meta-Tags, Open Graph, JSON-LD (FinancialService, FAQPage, WebApplication)
- Impressum & Datenschutzerklärung (Pflicht in DE)
- Vermittlerregister-Verlinkung (D-W-107-SY7W-04)

## Vor dem Go-Live anpassen

1. **`js/config.js`** — Domain `nikolaev.berlin.de` bestätigen oder anpassen; optional Formspree-Endpoint eintragen
2. **`impressum.html`** — bereits ausgefüllt (IHK Berlin, Markel Insurance SE / exali AG)
3. **`robots.txt`** & **`sitemap.xml`** — Domain bei Bedarf anpassen

Kontakt: +49 152 045 305 20 · nikolaev@berlin.de

## Lead-Formular anbinden

Option A — **Formspree** (kostenlos für Tests):
```js
// js/config.js
formEndpoint: 'https://formspree.io/f/fXXXXXXXX',
contactEmail: 'ihre@email.de',
```

Option B — **Europace / FinLink Magic Link** (CRM-Integration)

Option C — **Eigener Server** (Webhook in `formEndpoint`)

Ohne Endpoint: Formular öffnet `mailto:` mit vorausgefüllten Daten.

## Lokal testen

```bash
cd /workspace
python3 -m http.server 8080
# → http://localhost:8080
```

## Deployment

Statische Dateien auf jeden Hoster legen:
- GitHub Pages
- Netlify / Vercel (kostenlos, HTTPS inklusive)
- IONOS / Strato / All-Inkl

**HTTPS ist Pflicht** (DSGVO + Vertrauen).

## SEO-Ranking

Technische SEO ist implementiert. Für Top-Rankings bei Google zusätzlich:
- Eigene Domain mit Keyword (z. B. `baufinanzierung-berlin.de`)
- Google Business Profile anlegen
- 2–4 Blogartikel (z. B. „Baufinanzierung Berlin 2026")
- Backlinks von lokalen Verzeichnissen
