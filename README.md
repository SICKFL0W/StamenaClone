# StamenaClone 💪 | React Native Fitness App

> Open-source iOS application (Health & Fitness) focused on tracking training intervals and building daily habits.

## 📖 About the Project & My Motivation (The 16-Hour Build)
This project was created as a personal challenge: **Can I learn a new tech stack and deliver a functional iOS MVP?** I completely designed, programmed and deployed the app to a real device. To achieve this, I heavily utilized modern AI coding assistants, which allowed me to skip tedious boilerplate code and focus exclusively on complex logic (state management, interval timers) and UI/UX.

### 🛠️ Tech Stack
* **Framework:** React Native / Expo
* **Language:** TypeScript
* **AI Tooling:** AI-assisted programming (Gemini) for rapid prototyping
* **Deployment:** Compilation via Xcode, sideloading via AltStore

## ✨ Technical Challenges & Features
It's not just a simple stopwatch. In the backgorund he app handles:
* **Complex State Management:** The app guides through sequences (Squeeze, Relax, Push Out) with visual and text instructions.
* **Gamification & Logic:** Custom leveling system and "Streaks" calculation, where the app detects missed days and adjusts the user state accordingly.
* **Local Storage:** 100% Offline solution. All user data is stored securely and locally.

## 📸 UI Screenshots

<img width="292" height="630" alt="IMG_3499" src="https://github.com/user-attachments/assets/4348833f-0132-4be9-a831-b906c91ef819" />
<img width="292" height="630" alt="IMG_3597" src="https://github.com/user-attachments/assets/9ddde3f8-1143-4533-80eb-e979328ddc4c" />

---

## 🚀 Installation (Sideloading via AltStore)
Since this is an unofficial build without App Store distribution, the app uses `.ipa` sideloading.

### What you will need:
1. A computer with **AltServer** installed.
2. The **AltStore** app on your iPhone ([Installation Guide](https://altstore.io/)).
3. The downloaded `Stamena.ipa` file from this repository.

### Installation steps:
1. Go to the **[Releases](../../releases)** tab and download `Stamena.ipa`.
2. Send the file to your iPhone (save to Files, do NOT use AirDrop).
3. In the **AltStore** app, go to the **My Apps** tab and click on **+**.
4. Select the downloaded `.ipa` file. AltStore will sign the app with your Apple ID and install it *(requires connection to the same Wi-Fi as your computer OR connected with cable)*.

---

## 💻 For Developers (Building from source)
To run locally or modify the code:

```bash
# 1. Clone the repository:
git clone [https://github.com/SICKFLOW/StamenaClone.git](https://github.com/SICKFLOW/StamenaClone.git)

# 2. Install dependencies:
npm install

# 3. Start the local development server (Expo):
npx expo start
