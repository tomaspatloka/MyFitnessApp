# Můj Tréninkový Tracker

Aplikace pro sledování tréninkového plánu se zaměřením na hubnutí. PWA aplikace fungující offline.

## Funkce

- **12týdenní tréninkový plán** - strukturovaný program pro hubnutí
- **Sledování váhy** - historie a grafické zobrazení
- **Vlastní cviky** - možnost přidávat vlastní cvičení
- **Notifikace** - připomínky tréninku
- **Offline podpora** - funguje bez internetu (PWA)
- **Dark mode** - tmavý režim
- **Zimní režim** - nahrazení běhu chůzí

## Technologie

- Vanilla JavaScript (ES6+)
- CSS3 s Material Design 3
- Service Worker pro offline podporu
- Web Manifest pro PWA

## Struktura projektu

```
MyFitnessApp/
├── index.html              # Hlavní HTML
├── manifest.webmanifest    # PWA konfigurace
├── sw.js                   # Service Worker
├── _headers                # Cloudflare headers
├── css/
│   ├── style.css           # Hlavní styly
│   ├── exercises.css       # Styly pro cviky
│   └── notifications.css   # Styly notifikací
├── js/
│   ├── app.js              # Hlavní logika
│   ├── data.js             # Data cvičení
│   ├── exercises.js        # Správa cviků
│   └── notifications.js    # Systém notifikací
└── icons/
    ├── icon-128.png
    └── icon-512.png
```

## Nasazení

### GitHub Pages

1. Vytvořte nový repozitář na GitHubu
2. Nahrajte soubory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/UZIVATEL/REPO.git
   git push -u origin main
   ```
3. V nastavení repozitáře zapněte GitHub Pages

### Cloudflare Pages

1. Připojte GitHub repozitář k Cloudflare Pages
2. Nastavení buildu:
   - Build command: (ponechte prázdné)
   - Build output directory: `/`
3. Deploy

## Lokální vývoj

Pro lokální testování použijte jednoduchý HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Otevřete `http://localhost:8000`

## Požadavky

- Moderní webový prohlížeč (Chrome, Firefox, Safari, Edge)
- HTTPS pro plnou funkčnost PWA a notifikací

## Licence

MIT
