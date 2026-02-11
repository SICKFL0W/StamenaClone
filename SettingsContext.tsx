import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definice typů
type SettingsContextType = {
  godMode: boolean;
  setGodMode: (val: boolean) => void;
  stamenaLevel: number;
  setStamenaLevel: (val: number) => void;
  
  textCues: boolean;
  setTextCues: (val: boolean) => void;
  vibrationCues: boolean;
  setVibrationCues: (val: boolean) => void;
  audioCues: boolean;
  setAudioCues: (val: boolean) => void;
  workoutNotifs: boolean;
  setWorkoutNotifs: (val: boolean) => void;
  pointNotifs: boolean;
  setPointNotifs: (val: boolean) => void;
  
  // Body & Streaks
  totalPoints: number;
  addPoints: (amount: number) => void;
  streak: number;                 // <--- NOVÉ: Počet dní v řadě
  markWorkoutComplete: () => void; // <--- NOVÉ: Funkce pro zápočet dne

  // Reminders
  reminders: Date[];
  addReminder: () => void;
  removeReminder: (index: number) => void;
  updateReminderTime: (index: number, date: Date) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [godMode, setGodMode] = useState(false);
  const [stamenaLevel, setStamenaLevel] = useState(1);
  const [textCues, setTextCues] = useState(true);
  const [vibrationCues, setVibrationCues] = useState(true);
  const [audioCues, setAudioCues] = useState(true);
  const [workoutNotifs, setWorkoutNotifs] = useState(true);
  const [pointNotifs, setPointNotifs] = useState(true);
  
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0); // Default streak 0
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null); // Datum posledního cvičení
  
  const [reminders, setReminders] = useState<Date[]>([
    new Date(new Date().setHours(20, 0, 0, 0)) 
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // --- 1. NAČTENÍ DAT ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedData = await AsyncStorage.getItem('APP_SETTINGS');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          if (parsed.godMode !== undefined) setGodMode(parsed.godMode);
          if (parsed.stamenaLevel !== undefined) setStamenaLevel(parsed.stamenaLevel);
          if (parsed.textCues !== undefined) setTextCues(parsed.textCues);
          if (parsed.vibrationCues !== undefined) setVibrationCues(parsed.vibrationCues);
          if (parsed.audioCues !== undefined) setAudioCues(parsed.audioCues);
          if (parsed.workoutNotifs !== undefined) setWorkoutNotifs(parsed.workoutNotifs);
          if (parsed.pointNotifs !== undefined) setPointNotifs(parsed.pointNotifs);
          if (parsed.totalPoints !== undefined) setTotalPoints(parsed.totalPoints);
          
          // Načtení streaku
          if (parsed.streak !== undefined) setStreak(parsed.streak);
          if (parsed.lastWorkoutDate !== undefined) setLastWorkoutDate(parsed.lastWorkoutDate);
          
          if (parsed.reminders && Array.isArray(parsed.reminders)) {
            setReminders(parsed.reminders.map((d: string) => new Date(d)));
          }
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    loadSettings();
  }, []);

  // --- 2. UKLÁDÁNÍ DAT ---
  useEffect(() => {
    if (isLoading) return;

    const saveSettings = async () => {
      try {
        const dataToSave = {
          godMode, stamenaLevel, textCues, vibrationCues, audioCues, 
          workoutNotifs, pointNotifs, totalPoints, reminders,
          streak, lastWorkoutDate // Ukládáme i streak
        };
        await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(dataToSave));
      } catch (e) { console.error(e); }
    };

    saveSettings();
  }, [godMode, stamenaLevel, textCues, vibrationCues, audioCues, workoutNotifs, pointNotifs, totalPoints, reminders, streak, lastWorkoutDate, isLoading]);

  // --- LOGIKA ---
  
  const addPoints = (amount: number) => {
    setTotalPoints(prev => prev + amount);
  };

  // TADY JE TA MAGIE PRO STREAKS 🔥
  const markWorkoutComplete = () => {
    const today = new Date().toISOString().split('T')[0]; // Získá dnešní datum jako "2023-10-27"

    if (lastWorkoutDate === today) {
      // Dneska už jsi cvičil -> Streak nezvyšujeme, jen končíme
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastWorkoutDate === yesterdayStr) {
      // Cvičil jsi včera -> Super, zvyšujeme streak!
      setStreak(prev => prev + 1);
    } else {
      // Necvičil jsi včera (nebo je to poprvé) -> Reset na 1
      setStreak(1);
    }

    // Uložíme, že dneska je hotovo
    setLastWorkoutDate(today);
  };

  const addReminder = () => {
    setReminders([...reminders, new Date()]);
  };

  const removeReminder = (index: number) => {
    const newReminders = [...reminders];
    newReminders.splice(index, 1);
    setReminders(newReminders);
  };

  const updateReminderTime = (index: number, date: Date) => {
    const newReminders = [...reminders];
    newReminders[index] = date;
    setReminders(newReminders);
  };

  return (
    <SettingsContext.Provider value={{
      godMode, setGodMode,
      stamenaLevel, setStamenaLevel,
      textCues, setTextCues,
      vibrationCues, setVibrationCues,
      audioCues, setAudioCues,
      workoutNotifs, setWorkoutNotifs,
      pointNotifs, setPointNotifs,
      totalPoints, addPoints,
      streak, markWorkoutComplete, // Exportujeme ven
      reminders, addReminder, removeReminder, updateReminderTime
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};