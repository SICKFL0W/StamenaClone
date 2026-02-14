import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; 

// --- DEFINICE TYPŮ ---
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
  
  // Vlastní texty notifikací
  notifTitle: string;
  setNotifTitle: (val: string) => void;
  notifBody: string;
  setNotifBody: (val: string) => void;

  completedWorkouts: number;
  
  streak: number;
  markWorkoutComplete: () => void;

  reminders: Date[];
  addReminder: () => void;
  removeReminder: (index: number) => void;
  updateReminderTime: (index: number, date: Date) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Výchozí hodnoty
const DEFAULT_TITLE = "Time to Grind! 💪";
const DEFAULT_BODY = "Don't break the chain. Your daily workout is waiting.";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [godMode, setGodMode] = useState(false);
  const [stamenaLevel, setStamenaLevel] = useState(1);
  const [textCues, setTextCues] = useState(true);
  const [vibrationCues, setVibrationCues] = useState(true);
  const [audioCues, setAudioCues] = useState(true);
  
  const [workoutNotifs, setWorkoutNotifs] = useState(true);
  const [pointNotifs, setPointNotifs] = useState(true);

  const [notifTitle, setNotifTitle] = useState(DEFAULT_TITLE);
  const [notifBody, setNotifBody] = useState(DEFAULT_BODY);
  
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [streak, setStreak] = useState(0); 
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [lastWorkoutTimestamp, setLastWorkoutTimestamp] = useState<number | null>(null);

  const [reminders, setReminders] = useState<Date[]>([
    new Date(new Date().setHours(18, 0, 0, 0)) // Default 18:00
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // --- FUNKCE PRO PŘEPLÁNOVÁNÍ NOTIFIKACÍ ---
  const rescheduleNotifications = async () => {
    // 1. Zrušíme všechno staré (Clean Slate)
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🧹 [Settings] Staré notifikace smazány.");

    if (!workoutNotifs || reminders.length === 0) {
        console.log("🔕 [Settings] Notifikace vypnuty nebo žádné časy.");
        return;
    }

    // Kontrola oprávnění
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return;
    }

    // 2. Naplánujeme DENNÍ připomínky (iOS Calendar Trigger)
    for (const date of reminders) {
      const triggerHour = date.getHours();
      const triggerMinute = date.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notifTitle, 
          body: notifBody,   
          sound: 'default',
        },
        trigger: {
          hour: triggerHour,
          minute: triggerMinute,
          repeats: true, // Opakuje se každý den
        } as any, // <--- ZDE JE "as any", ABY TO NEŘVALO
      });
      console.log(`🔔 [Settings] Denní notifikace nastavena na: ${triggerHour}:${triggerMinute}`);
    }

    // 3. PANIC NOTIFIKACE (23h od posledního tréninku)
    if (lastWorkoutTimestamp) {
        const panicTime = lastWorkoutTimestamp + (23 * 60 * 60 * 1000); 
        const now = Date.now();
        const secondsUntilPanic = (panicTime - now) / 1000;

        if (secondsUntilPanic > 60) { 
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⚠️ STREAK RISK ⚠️",
                    body: "23 hours since last workout! Keep the rhythm!",
                    sound: 'default',
                },
                trigger: {
                    seconds: secondsUntilPanic, 
                    repeats: false 
                } as any, // <--- I TADY "as any"
            });
            console.log(`⚠️ [Settings] Panic notifikace nastavena za ${Math.round(secondsUntilPanic / 60)} minut.`);
        }
    }
  };

  // --- 1. NAČTENÍ DAT PŘI STARTU ---
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
          
          if (parsed.notifTitle !== undefined) setNotifTitle(parsed.notifTitle);
          if (parsed.notifBody !== undefined) setNotifBody(parsed.notifBody);

          if (parsed.completedWorkouts !== undefined) setCompletedWorkouts(parsed.completedWorkouts);
          
          if (parsed.reminders && Array.isArray(parsed.reminders)) {
            setReminders(parsed.reminders.map((d: string) => new Date(d)));
          }

          if (parsed.lastWorkoutTimestamp) setLastWorkoutTimestamp(parsed.lastWorkoutTimestamp);

          // Streak logika
          let loadedStreak = parsed.streak || 0;
          const loadedLastDate = parsed.lastWorkoutDate || null;
          
          if (loadedLastDate) {
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (loadedLastDate !== todayStr && loadedLastDate !== yesterdayStr) {
                loadedStreak = 0; 
            }
          } else {
             loadedStreak = 0;
          }

          setStreak(loadedStreak);
          setLastWorkoutDate(loadedLastDate);
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    loadSettings();
  }, []);

  // --- 2. UKLÁDÁNÍ A PŘEPLÁNOVÁNÍ ---
  useEffect(() => {
    if (isLoading) return;

    const saveAndSchedule = async () => {
      try {
        const dataToSave = {
          godMode, stamenaLevel, textCues, vibrationCues, audioCues, 
          workoutNotifs, pointNotifs, 
          notifTitle, notifBody,
          completedWorkouts, 
          reminders,
          streak, lastWorkoutDate, lastWorkoutTimestamp 
        };
        await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(dataToSave));

        // Přeplánovat notifikace s aktuálními daty
        await rescheduleNotifications();

      } catch (e) { console.error(e); }
    };

    saveAndSchedule();

  }, [godMode, stamenaLevel, textCues, vibrationCues, audioCues, workoutNotifs, pointNotifs, notifTitle, notifBody, completedWorkouts, reminders, streak, lastWorkoutDate, lastWorkoutTimestamp, isLoading]);


  // --- LOGIKA DOKONČENÍ WORKOUTU ---
  const markWorkoutComplete = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimestamp = now.getTime();

    // 1. Aktualizujeme timestamp (to spustí useEffect, který přeplánuje Panic notifikaci)
    setLastWorkoutTimestamp(currentTimestamp);
    setCompletedWorkouts(prev => prev + 1);

    // 2. Streak logika
    if (lastWorkoutDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastWorkoutDate === yesterdayStr) {
            setStreak(prev => prev + 1); 
        } else {
            setStreak(1); 
        }
        setLastWorkoutDate(todayStr);
    }
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
      
      notifTitle, setNotifTitle,
      notifBody, setNotifBody,

      completedWorkouts, 
      
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