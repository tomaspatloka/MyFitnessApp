# Workout Builder - Ověření funkcí ✅

## Opravené kritické chyby
- ✅ **Opravena duplicitní deklarace APP_VERSION** - odstraněna na řádku 1891
- ✅ **Opraveny null reference errors** - přidány kontroly před přístupem k DOM elementům
- ✅ **Opraveno tlačítko Workouts** - nyní správně přepíná na Workout Builder místo přehledu
- ✅ **Přidána verze aplikace** - "v2.0" zobrazena vedle "Můj Trénink"
- ✅ **Přesunuto tlačítko nastavení** - nyní v pravém horním rohu

## Implementované funkce

### 1. Vlastní tréninky 🏋️
- ✅ Vytváření vlastních tréninkových plánů
- ✅ Přidávání cviků s nastavením sérií a opakování
- ✅ Ukládání vlastních tréninků do LocalStorage
- ✅ Editace existujících tréninků
- ✅ Mazání tréninků

### 2. Šablony tréninků 📋
- ✅ **Push/Pull/Legs** - 3denní split
- ✅ **Upper/Lower Split** - 2denní split
- ✅ **Full Body 3x týdně**
- ✅ **HIIT Cardio**
- ✅ **Core & Abs Workout**

### 3. Aktivní trénink ⏱️
- ✅ Timer pro cviky a odpočinek
- ✅ Počítadlo dokončených sérií
- ✅ Sledování repetic v každé sérii
- ✅ Poznámky ke cviků během tréninku
- ✅ Dokončení tréninku s uložením do historie

### 4. Historie tréninků 📊
- ✅ Zobrazení všech dokončených tréninků
- ✅ Detailní statistiky (čas, cviky, série)
- ✅ Detail jednotlivých tréninků
- ✅ Mazání historických záznamů

### 5. Pokročilé funkce 🚀

#### 1RM Kalkulačka a progres
- ✅ Automatický výpočet 1RM (Epley vzorec)
- ✅ Graf progrese síly pro jednotlivé cviky
- ✅ Chart.js vizualizace s interaktivním grafem
- ✅ Sledování síly v čase

#### Notifikace
- ✅ Browser notifikace po dokončení tréninku
- ✅ Vibrace při dokončení (na podporovaných zařízeních)
- ✅ Detailní statistiky v notifikaci

#### Speciální časovače
- ✅ **Tabata Timer** - 8 rounds × (20s práce / 10s odpočinek)
- ✅ **EMOM Timer** - Every Minute On the Minute
- ✅ **AMRAP Timer** - As Many Rounds As Possible
- ✅ **Custom Interval Timer** - vlastní intervaly

## Jak otestovat

### Test 1: Základní funkčnost
1. Klikněte na tlačítko "Workouts" v dolním menu
2. Měli byste vidět Workout Builder (NE přehled)
3. Zkontrolujte, že vidíte 5 záložek: Vlastní, Šablony, Aktivní, Historie, Pokročilé

### Test 2: Vytvoření vlastního tréninku
1. V záložce "Vlastní" klikněte "Vytvořit nový trénink"
2. Zadejte název (např. "Můj trénink")
3. Přidejte cvik pomocí tlačítka "Přidat cvik"
4. Nastavte série a opakování
5. Klikněte "Uložit trénink"

### Test 3: Použití šablony
1. Přejděte do záložky "Šablony"
2. Vyberte šablonu (např. "Push/Pull/Legs - Push Day")
3. Klikněte "Zahájit trénink"
4. Měli byste být přesměrováni do záložky "Aktivní"

### Test 4: Aktivní trénink
1. Zahajte jakýkoli trénink
2. Klikněte "Dokončit sérii" u cviku
3. Zadejte počet opakování
4. Sledujte timer odpočinku (60 sekund)
5. Dokončete trénink tlačítkem "Dokončit trénink"

### Test 5: 1RM Progress
1. Nejprve dokončete několik tréninků se silovou složkou
2. Přejděte do záložky "Pokročilé"
3. Vyberte cvik z dropdown menu
4. Měli byste vidět graf progrese 1RM

### Test 6: Speciální časovače
1. V záložce "Pokročilé" klikněte na "Tabata Timer"
2. Nastavte název cviku
3. Spusťte timer
4. Sledujte odpočet a střídání work/rest period

## Technické detaily

### Soubory
- `js/workout-builder.js` - Hlavní logika (WorkoutBuilder class)
- `js/workout-builder-ui.js` - UI rendering a interakce
- `css/workout-builder.css` - Material Design 3 styling
- `js/app.js` - Integrace do hlavní aplikace

### LocalStorage klíče (pro každý profil)
- `customWorkouts_${profile}` - Vlastní tréninky
- `workoutHistory_${profile}` - Historie dokončených tréninků
- `activeWorkout_${profile}` - Aktuálně aktivní trénink

### Dependencies
- Chart.js 4.4.1 - Pro grafy progrese 1RM
- Material Symbols - Ikony
- Browser Notifications API - Notifikace
- Vibration API - Haptická zpětná vazba

## Známé limitace
- Favicon 404 - neovlivňuje funkčnost (lze přidat favicon později)
- Periodic background sync - vyžaduje HTTPS pro produkční nasazení

## Verze
**v2.0.0** - 2026-02-01
- První vydání Workout Builder systému
- Kompletní implementace všech požadovaných funkcí
