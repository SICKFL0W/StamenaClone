import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; // <--- DŮLEŽITÝ IMPORT

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
  
  totalPoints: number;
  addPoints: (amount: number) => void;
  streak: number;
  markWorkoutComplete: () => void;

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
  const [streak, setStreak] = useState(0); 
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  
  const [reminders, setReminders] = useState<Date[]>([
    new Date(new Date().setHours(20, 0, 0, 0)) 
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // --- HELPER: Přeplánování notifikací (DENNĚ) ---
  const rescheduleNotifications = async (currentReminders: Date[], isEnabled: boolean) => {
    // 1. Smažeme staré
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Pokud vypnuto, končíme
    if (!isEnabled) return;

    // 2. Naplánujeme nové
    for (const date of currentReminders) {
      const triggerHour = date.getHours();
      const triggerMinute = date.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Grind! 💪",
          body: "Don't break the chain. Your daily workout is waiting.",
          sound: true,
        },
        // ZMĚNA ZDE: Přidáme přetypování "as ...", aby TypeScript neřval
        trigger: {
          hour: triggerHour,
          minute: triggerMinute,
          repeats: true,
        } as any, 
      });
    }
  };

  // --- 1. NAČTENÍ DAT + KONTROLA STREAKU ---
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
          
          // Reminders
          if (parsed.reminders && Array.isArray(parsed.reminders)) {
            setReminders(parsed.reminders.map((d: string) => new Date(d)));
          }

          // --- LOGIKA STREAKU PŘI STARTU ---
          // Zkontrolujeme, jestli uběhlo více než 1 den od posledního cvičení
          let loadedStreak = parsed.streak || 0;
          const loadedLastDate = parsed.lastWorkoutDate || null;
          
          if (loadedLastDate) {
            const today = new Date();
            const last = new Date(loadedLastDate);
            
            // Rozdíl ve dnech
            const diffTime = Math.abs(today.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // Pokud je rozdíl větší než 1 den (např. 2 dny nečvičil), a dneska ještě necvičil
            // POZN: Porovnáváme stringy data, abychom ošetřili "dnes"
            const todayStr = today.toISOString().split('T')[0];
            
            if (todayStr !== loadedLastDate) {
                // Pokud poslední trénink nebyl včera (ale dýl), resetujeme streak
                // Hledáme "včera"
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (loadedLastDate !== yesterdayStr) {
                    loadedStreak = 0; // BROKEN STREAK
                }
            }
          }

          setStreak(loadedStreak);
          setLastWorkoutDate(loadedLastDate);
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    loadSettings();
  }, []);

  // --- 2. UKLÁDÁNÍ DAT + AUTOMATICKÉ NOTIFIKACE ---
  useEffect(() => {
    if (isLoading) return;

    const saveAndSchedule = async () => {
      try {
        const dataToSave = {
          godMode, stamenaLevel, textCues, vibrationCues, audioCues, 
          workoutNotifs, pointNotifs, totalPoints, reminders,
          streak, lastWorkoutDate
        };
        await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(dataToSave));
        
        // PŘEPLÁNOVAT NOTIFIKACE PŘI KAŽDÉ ZMĚNĚ
        // Pokud se změní reminders nebo workoutNotifs, funkce se spustí
        if (workoutNotifs) {
            await rescheduleNotifications(reminders, true);
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }

      } catch (e) { console.error(e); }
    };

    saveAndSchedule();
  }, [godMode, stamenaLevel, textCues, vibrationCues, audioCues, workoutNotifs, pointNotifs, totalPoints, reminders, streak, lastWorkoutDate, isLoading]);

  // --- LOGIKA ---
  
  const addPoints = (amount: number) => {
    setTotalPoints(prev => prev + amount);
  };

  const markWorkoutComplete = () => {
    const today = new Date().toISOString().split('T')[0];

    if (lastWorkoutDate === today) {
      return; // Dnes už hotovo
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastWorkoutDate === yesterdayStr) {
      setStreak(prev => prev + 1); // Navázal na včerejšek
    } else {
      setStreak(1); // Začíná od znova
    }

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
      streak, markWorkoutComplete, 
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