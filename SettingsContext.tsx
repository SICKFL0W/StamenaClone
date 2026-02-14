import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; 

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
  
  // NOVÉ: Vlastní texty notifikací
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

// Výchozí hodnoty (Stock)
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

  // NOVÉ STATE PRO TEXTY
  const [notifTitle, setNotifTitle] = useState(DEFAULT_TITLE);
  const [notifBody, setNotifBody] = useState(DEFAULT_BODY);
  
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  
  const [streak, setStreak] = useState(0); 
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  
  const [lastWorkoutTimestamp, setLastWorkoutTimestamp] = useState<number | null>(null);

  const [reminders, setReminders] = useState<Date[]>([
    new Date(new Date().setHours(18, 0, 0, 0)) 
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // --- FUNKCE NA PLÁNOVÁNÍ NOTIFIKACÍ ---
  const rescheduleNotifications = async (
    currentReminders: Date[], 
    isEnabled: boolean,
    lastWorkoutTime: number | null,
    title: string, // Přijímáme aktuální title
    body: string   // Přijímáme aktuální body
  ) => {
    // 1. Smažeme vše
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!isEnabled) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // 2. Naplánujeme standardní denní připomínky (S VLASTNÍM TEXTEM)
    for (const date of currentReminders) {
      const triggerHour = date.getHours();
      const triggerMinute = date.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title, // Použijeme vlastní
          body: body,   // Použijeme vlastní
          sound: true,
        },
        trigger: {
          hour: triggerHour,
          minute: triggerMinute,
          repeats: true, 
        } as any, 
      });
    }

    // 3. DYNAMICKÁ "PANIC" NOTIFIKACE (23 hodin od posledního tréninku)
    // Panic mode necháme "hardcoded", aby to bylo výstražné, nebo můžeme taky customizovat.
    // Pro teď necháme systémovou výstrahu.
    if (lastWorkoutTime) {
        const panicTime = lastWorkoutTime + (23 * 60 * 60 * 1000); 
        const now = Date.now();
        const secondsUntilPanic = (panicTime - now) / 1000;

        if (secondsUntilPanic > 0) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⚠️ STREAK RISK ⚠️",
                    body: "It's been almost 24h since your last workout! Don't break the rhythm!",
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    seconds: secondsUntilPanic, 
                    repeats: false 
                } as any,
            });
        }
    }
  };

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
          
          // Načtení textů
          if (parsed.notifTitle !== undefined) setNotifTitle(parsed.notifTitle);
          if (parsed.notifBody !== undefined) setNotifBody(parsed.notifBody);

          if (parsed.completedWorkouts !== undefined) setCompletedWorkouts(parsed.completedWorkouts);
          
          if (parsed.reminders && Array.isArray(parsed.reminders)) {
            setReminders(parsed.reminders.map((d: string) => new Date(d)));
          }

          if (parsed.lastWorkoutTimestamp) {
              setLastWorkoutTimestamp(parsed.lastWorkoutTimestamp);
          }

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

  // --- 2. UKLÁDÁNÍ DAT ---
  useEffect(() => {
    if (isLoading) return;

    const saveSettings = async () => {
      try {
        const dataToSave = {
          godMode, stamenaLevel, textCues, vibrationCues, audioCues, 
          workoutNotifs, pointNotifs, 
          notifTitle, notifBody, // Ukládáme texty
          completedWorkouts, 
          reminders,
          streak, lastWorkoutDate, lastWorkoutTimestamp 
        };
        await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(dataToSave));
      } catch (e) { console.error(e); }
    };

    saveSettings();
    
    // Přeplánování při jakékoliv změně relevantních dat
    if (workoutNotifs) {
        rescheduleNotifications(reminders, true, lastWorkoutTimestamp, notifTitle, notifBody);
    } else {
        Notifications.cancelAllScheduledNotificationsAsync();
    }

  }, [godMode, stamenaLevel, textCues, vibrationCues, audioCues, workoutNotifs, pointNotifs, notifTitle, notifBody, completedWorkouts, reminders, streak, lastWorkoutDate, lastWorkoutTimestamp, isLoading]);


  // --- LOGIKA DOKONČENÍ WORKOUTU ---
  const markWorkoutComplete = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimestamp = now.getTime();

    setLastWorkoutTimestamp(currentTimestamp);

    if (workoutNotifs) {
        rescheduleNotifications(reminders, true, currentTimestamp, notifTitle, notifBody);
    }

    if (lastWorkoutDate === todayStr) {
      return; 
    }

    setCompletedWorkouts(prev => prev + 1);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastWorkoutDate === yesterdayStr) {
      setStreak(prev => prev + 1); 
    } else {
      setStreak(1); 
    }

    setLastWorkoutDate(todayStr);
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