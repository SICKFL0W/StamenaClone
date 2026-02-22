# StamenaClone 💪 | React Native Fitness App

> Open-source iOS aplikace (Health & Fitness) zaměřená na sledování tréninkových intervalů a budování každodenních návyků. Žádné předplatné, žádné reklamy, 100% offline.

## 📖 O projektu & Moje motivace (The 16-Hour Build)
Tento projekt vznikl jako osobní výzva: **Dokážu se naučit nový technologický stack a doručit funkční iOS MVP za méně než 24 hodin?** Aplikaci jsem kompletně navrhl, naprogramoval a nasadil na reálné zařízení za **16 hodin čistého času vývoje**. K dosažení této rychlosti jsem masivně využíval moderní AI coding asistenty, což mi umožnilo přeskočit zdlouhavé psaní boilerplate kódu a soustředit se výhradně na složitou byznys logiku (state management, intervalové časovače) a UI/UX.

### 🛠️ Tech Stack
* **Framework:** React Native / Expo
* **Jazyk:** TypeScript (pro typovou bezpečnost a čistší kód)
* **AI Tooling:** AI asistované programování (Cursor / LLM modely) pro rapid prototyping
* **Deployment:** Kompilace přes Xcode, sideloading přes AltStore

## ✨ Technické výzvy & Funkce
Nejde jen o obyčejné stopky. Aplikace na pozadí řeší komplexní správu stavu:
* **Komplexní State Management:** Aplikace tě provede sekvencemi (Squeeze, Relax, Push Out) s vizuálními i textovými pokyny, kde každá vteřina musí být perfektně synchronizovaná.
* **Gamifikace & Logika:** Vlastní levelovací systém a výpočet "Streaks" (sérií). Aplikace detekuje vynechané dny a na základě toho upravuje uživatelský stav.
* **Local Storage:** 100% Offline řešení. Veškerá uživatelská data se ukládají bezpečně a lokálně.

## 📸 Screenshoty UI
*(Tady přetáhni screenshoty přímo z Macu do GitHub editoru)*

| Domovská obrazovka | Během Workoutu |
| :---: | :---: |
| ![Home](link-na-tvuj-screen-1) | ![Workout](link-na-tvuj-screen-2) |

---

## 🚀 Instalace (Sideloading přes AltStore)
Jelikož se jedná o neoficiální build bez App Store distribuce, aplikace využívá `.ipa` sideloading.

### Co budeš potřebovat:
1. Počítač s nainstalovaným **AltServerem**.
2. Aplikaci **AltStore** ve svém iPhonu ([Návod na instalaci](https://altstore.io/)).
3. Stažený soubor `Stamena.ipa` z tohoto repozitáře.

### Postup instalace:
1. Přejdi do záložky **[Releases](../../releases)** a stáhni si `Stamena.ipa`.
2. Pošli si soubor do iPhonu.
3. V aplikaci **AltStore** přejdi do záložky **My Apps** a klikni na **+**.
4. Vyber stažený `.ipa` soubor. AltStore aplikaci podepíše tvým Apple ID a nainstaluje *(vyžaduje připojení na stejnou Wi-Fi jako počítač)*.

---

## 💻 Pro vývojáře (Build ze zdrojáků)
Pro lokální spuštění nebo úpravy kódu:

```bash
# 1. Naklonuj si repozitář:
git clone [https://github.com/SICKFLOW/StamenaClone.git](https://github.com/SICKFLOW/StamenaClone.git)

# 2. Nainstaluj závislosti:
npm install

# 3. Spusť lokální vývojový server (Expo):
npx expo start
