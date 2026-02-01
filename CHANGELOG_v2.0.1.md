# Changelog v2.0.1 - 2026-02-01

## 🐛 Opravy chyb

### Favicon.ico 404 Error - OPRAVENO ✅
- **Problém**: Browser hledal favicon.ico, ale soubor neexistoval → 404 error v konzoli
- **Řešení**:
  - Vytvořen `favicon.ico` z existující ikony (icon-128.png)
  - Obsahuje 3 velikosti: 16x16, 32x32, 48x48 pixelů
  - Přidán odkaz do `<head>` sekce v index.html
  - Ikona zobrazuje svalovou ruku 💪 (brand aplikace)

### Reorganizace nastavení - IMPLEMENTOVÁNO ✅
- **Problém**: Menu Nastavení bylo příliš dlouhé a nepřehledné
- **Řešení**: Implementovány **sbalitelné sekce (accordion)**

## ✨ Nové funkce

### Accordion v Nastavení
Nastavení nyní rozděleno do 4 logických sekcí:

#### 👤 **Profil** (výchozí: sbaleno)
- Aktivní profil (jméno, ikona, Sync ID)
- Přepínání mezi profily
- Přidání nového profilu
- Smazání profilu
- **Osobní údaje**: Cílová váha, Výška, Věk

#### ⚙️ **Systém** (výchozí: sbaleno)
- Tmavý režim
- Zimní režim
- **Oznámení**: Notifikační nastavení

#### 💾 **Data & Cloud** (výchozí: sbaleno)
- **Cloudová synchronizace**:
  - Zapnout/vypnout cloud sync
  - Status synchronizace (Online/Offline)
  - Čas poslední synchronizace
  - Tlačítko "Synchronizovat nyní"
  - Zobrazit Sync ID
- **Správa dat**:
  - Automatické ukládání
  - Export dat
  - Import dat

#### ℹ️ **O aplikaci** (výchozí: sbaleno)
- Zkontrolovat aktualizace
- Vynutit aktualizaci (clear cache)
- O aplikaci
- Resetovat aplikaci

### UI vylepšení
- **Vizuální ikony** v názvech sekcí (emoji + Material Icons)
- **Plynulé animace** při rozbalování/sbalování (0.3s ease)
- **Šedé pozadí** pro accordion sekce (Material Design 3)
- **Rotace šipek** při rozbalení (expand_more ikona)
- Hover efekt na hlavičky sekcí

## 📁 Nové soubory

### `favicon.ico`
- Multi-resolution favicon (16x16, 32x32, 48x48)
- Generován z `icons/icon-128.png`
- 898 bytes

### `js/settings-accordion.js`
- Nová funkce `renderSettingsAccordion()`
- Funkce `toggleAccordion(accordionId)` pro rozbalování sekcí
- Čistý, modulární kód oddělený od app.js

### `WORKOUT_BUILDER_VERIFICATION.md`
- Dokumentace Workout Builder systému
- Testovací checklist
- Technické detaily implementace

## 🔧 Upravené soubory

### `index.html`
- Přidán `<link rel="icon" href="/favicon.ico">` do `<head>`
- Přidán `<script src="js/settings-accordion.js">` před app.js

### `css/style.css`
- Přidány CSS třídy pro accordion:
  - `.settings-accordion` - Container
  - `.accordion-header` - Hlavička (klikací)
  - `.accordion-header-content` - Obsah hlavičky (ikona + text)
  - `.accordion-icon` - Šipka s rotací
  - `.accordion-content` - Sbalitelný obsah
  - `.accordion-body` - Vnitřní padding

### `js/app.js`
- Upravena funkce `renderSettings()`:
  - Nyní kontroluje, zda existuje `renderSettingsAccordion()`
  - Pokud ano, volá novou accordion verzi
  - Fallback na starou verzi pro kompatibilitu

## 🎯 Testování

### Favicon test
1. ✅ Otevřít aplikaci v browseru
2. ✅ Zkontrolovat konzoli - favicon.ico 404 error by měl zmizet
3. ✅ Zkontrolovat záložku - měla by zobrazovat ikonu 💪

### Accordion test
1. ✅ Přejít do Nastavení
2. ✅ Všechny sekce by měly být sbalené
3. ✅ Kliknout na "👤 Profil" → mělo by se rozbalit
4. ✅ Kliknout znovu → mělo by se sbalit
5. ✅ Šipka by se měla otáčet při kliknutí
6. ✅ Rozbalit více sekcí najednou

## 🌐 Kompatibilita
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 📊 Velikost změn
- **Přidáno**: 3 soubory (+~350 řádků kódu)
- **Upraveno**: 3 soubory (+~80 řádků)
- **Nový favicon**: 898 bytes

## 🔜 Co dál?
- Uživatelské testování accordion UX
- Možnost nastavit výchozí rozbalené sekce
- Animace při prvním otevření nastavení
- Persist accordion stavu do LocalStorage
