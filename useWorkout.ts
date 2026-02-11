import { useState, useEffect, useRef } from 'react';
import { Vibration, LayoutAnimation, Platform } from 'react-native';
import Sound from 'react-native-sound';
import { useSettings } from './SettingsContext';

// Nastavení zvuku pro iOS, aby hrál i v tichém režimu
Sound.setCategory('Playback', true);

const getWorkoutPlan = (level: number) => {
  const safeLevel = Math.max(1, level);
  const plan = [];

  const normalSqueeze = Math.min(10, 3 + Math.floor(safeLevel / 2.5)); 
  const normalRelax = Math.max(3, 5 - Math.floor(safeLevel / 10)); 
  const normalReps = Math.min(15, 10 + Math.floor(safeLevel / 4));

  plan.push({ label: "Regular Kegels", squeeze: normalSqueeze, relax: normalRelax, reps: normalReps });

  const rapidReps = Math.min(50, 10 + (safeLevel * 2));
  plan.push({ label: "Rapid Fire", squeeze: 0.8, relax: 0.8, reps: rapidReps });

  const longSqueeze = 10 + (safeLevel * 1.5); 
  plan.push({ label: "Long Holds", squeeze: longSqueeze, relax: 10, reps: Math.min(5, 2 + Math.floor(safeLevel / 5)) });

  if (safeLevel >= 1) { 
      plan.push({ label: "Reverse Kegels", squeeze: normalSqueeze, relax: normalRelax, reps: normalReps });
      plan.push({ label: "Reverse Rapid", squeeze: 1, relax: 1, reps: rapidReps });
      plan.push({ label: "Reverse Holds", squeeze: longSqueeze, relax: 10, reps: Math.min(5, 2 + Math.floor(safeLevel / 5)) });
  }

  return plan;
};

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const useWorkout = () => {
  const { 
    textCues, 
    vibrationCues, 
    audioCues, 
    addPoints, 
    markWorkoutComplete, 
    stamenaLevel, 
    setStamenaLevel 
  } = useSettings();
  
  const [workoutPlan, setWorkoutPlan] = useState(getWorkoutPlan(stamenaLevel));
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const currentSet = workoutPlan[currentSetIndex]; 

  const [isActive, setIsActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  
  const [isSqueezing, setIsSqueezing] = useState(true);
  const [timeLeft, setTimeLeft] = useState(currentSet.squeeze);
  const [currentRep, setCurrentRep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);

  const timerRef = useRef<any>(null);

  // Reset při změně levelu
  useEffect(() => { if (!isActive) fullReset(); }, [stamenaLevel]);

  // Funkce pro přehrávání zvuku
  const playSoundFile = (filename: string) => {
    // Tady to bere aktuální hodnotu audioCues
    if (!audioCues) return; 
    
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
        if (!error) {
            sound.play((success) => {
                sound.release();
            });
        }
    });
  };

  const fullReset = () => {
    const newPlan = getWorkoutPlan(stamenaLevel);
    setWorkoutPlan(newPlan);
    setCurrentSetIndex(0);
    resetSet(newPlan[0]);
    setIsFinished(false);
    setIsActive(false);
    setIsCountingDown(false);
    if (timerRef.current) clearInterval(timerRef.current);
    calculateTotalTime(newPlan, 0, 1, true, newPlan[0].squeeze);
  };

  const resetSet = (setConfig: any) => {
    setIsSqueezing(true);
    setTimeLeft(setConfig.squeeze);
    setCurrentRep(1);
    setProgress(0);
  };

  const calculateTotalTime = (plan: any[], setIndex: number, rep: number, squeezing: boolean, currentPhaseTime: number) => {
      let total = currentPhaseTime;
      const set = plan[setIndex];
      if (squeezing) total += set.relax; 
      const remainingReps = set.reps - rep;
      if (remainingReps > 0) total += remainingReps * (set.squeeze + set.relax);
      for (let i = setIndex + 1; i < plan.length; i++) {
          total += plan[i].reps * (plan[i].squeeze + plan[i].relax);
      }
      setTotalTimeLeft(total);
  };

  const toggleTimer = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (isFinished) { fullReset(); return; }

    if (isActive) {
        setIsActive(false);
        setIsCountingDown(false);
        if (timerRef.current) clearInterval(timerRef.current);
    } else {
        const isFreshStart = currentSetIndex === 0 && currentRep === 1 && progress === 0;
        if (isFreshStart && !isCountingDown) {
            startCountdown();
        } else {
            setIsActive(true);
        }
    }
  };

  const startCountdown = () => {
      setIsCountingDown(true);
      setCountdownValue(3);
      let counter = 3;
      const countInterval = setInterval(() => {
          counter--;
          if (counter > 0) {
              setCountdownValue(counter);
          } else {
              clearInterval(countInterval);
              setIsCountingDown(false);
              setIsActive(true);
              // Tady to funguje, protože startCountdown se volá na kliknutí (nový render)
              playSoundFile('repetition.mp3');
          }
      }, 1000);
  };

  // --- HLAVNÍ LOGIKA ČASOVAČE ---
  useEffect(() => {
    if (isActive && !isFinished && !isCountingDown) {
      const intervalMs = 30;
      const decrement = intervalMs / 1000;
      const phaseTotalTime = isSqueezing ? currentSet.squeeze : currentSet.relax;

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - decrement;
          const progressValue = Math.max(0, Math.min(1, (phaseTotalTime - newTime) / phaseTotalTime));
          setProgress(progressValue);
          setTotalTimeLeft(prevTotal => Math.max(0, prevTotal - decrement));

          if (newTime <= 0) {
            handlePhaseChange(); // Volá funkci, která používá settings
            return 0;
          }
          return newTime;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    
    // 🔥 OPRAVA ZDE: Přidali jsme audioCues a vibrationCues do závislostí.
    // Když se změní settings, timer se restartuje s novými hodnotami.
  }, [isActive, isFinished, isSqueezing, currentSet, isCountingDown, audioCues, vibrationCues]);

  const handlePhaseChange = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isSqueezing) {
      // KONEC SQUEEZE -> ZAČÁTEK RELAX
      setIsSqueezing(false);
      setTimeLeft(currentSet.relax);
      setProgress(0);
      calculateTotalTime(workoutPlan, currentSetIndex, currentRep, false, currentSet.relax);

      if (currentSet.label.includes("Rapid")) {
         if (vibrationCues) Vibration.vibrate(50); 
      } else {
         if (vibrationCues) Vibration.vibrate([0, 50, 50, 50]);
         playSoundFile('repetition_end.mp3');
      }
    } else {
      // KONEC RELAX -> ZAČÁTEK SQUEEZE (nebo další set)
      if (currentRep >= currentSet.reps) {
        nextSetOrFinish();
        return;
      }
      const nextRep = currentRep + 1;
      setCurrentRep(nextRep);
      setIsSqueezing(true);
      setTimeLeft(currentSet.squeeze);
      setProgress(0);
      calculateTotalTime(workoutPlan, currentSetIndex, nextRep, true, currentSet.squeeze);
      
      if (currentSet.label.includes("Rapid")) {
        if (vibrationCues) Vibration.vibrate(50);
      } else {
        if (vibrationCues) Vibration.vibrate(100);
        playSoundFile('repetition.mp3');
      }
    }
  };

  const nextSetOrFinish = () => {
    if (currentSetIndex < workoutPlan.length - 1) {
      const nextIndex = currentSetIndex + 1;
      setCurrentSetIndex(nextIndex);
      resetSet(workoutPlan[nextIndex]);
      calculateTotalTime(workoutPlan, nextIndex, 1, true, workoutPlan[nextIndex].squeeze);
      
      playSoundFile('workout_finish.mp3'); 
      if (vibrationCues) Vibration.vibrate(500);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setIsFinished(true);
    setIsActive(false);
    setTotalTimeLeft(0);
    
    if (vibrationCues) Vibration.vibrate(1000);
    playSoundFile('workout_finish.mp3');
    
    addPoints(100 + (stamenaLevel * 10)); 
    if (stamenaLevel < 20) setStamenaLevel(stamenaLevel + 1);

    markWorkoutComplete();
  };

  return { 
    isActive, isSqueezing, timeLeft: Math.ceil(timeLeft),
    progress, currentRep, toggleTimer, isFinished, 
    currentSetIndex: currentSetIndex + 1,
    totalSets: workoutPlan.length,
    currentSetLabel: currentSet.label,
    totalRepsInSet: currentSet.reps,
    isCountingDown, countdownValue,
    formattedTotalTime: formatTime(totalTimeLeft),
    resetWorkout: fullReset
  };
};