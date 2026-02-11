import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { BounceButton } from '../BounceButton';
import { useWorkout } from '../useWorkout';
import { useSettings } from '../SettingsContext';


const { width } = Dimensions.get('window');

// --- KONFIGURACE KRUHŮ ---
const OUTER_SIZE = width * 0.85; 
const OUTER_STROKE = 14; 
const OUTER_RADIUS = (OUTER_SIZE - OUTER_STROKE) / 2;
const OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS;

const INNER_SIZE = width * 0.74; 
const INNER_STROKE = 10;
const INNER_RADIUS = (INNER_SIZE - INNER_STROKE) / 2;
const INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;

function HomeScreen() {

  
  const { stamenaLevel, totalPoints, textCues, streak } = useSettings(); 

  
  
  const { 
    isActive, isSqueezing, timeLeft, currentRep, toggleTimer, isFinished, progress,
    currentSetIndex, totalSets, currentSetLabel, totalRepsInSet,
    isCountingDown, countdownValue,
    formattedTotalTime,
    resetWorkout
  } = useWorkout();

  const nextLevelPoints = stamenaLevel * 250;
  
  const activeColor = isSqueezing ? "#C0392B" : "#27ae60";
  const trackColor = "#E5E5EA"; 

  const segmentLength = OUTER_CIRCUMFERENCE / totalSets;
  const gapLength = 10; 
  const dashLength = segmentLength - gapLength;
  const startRotation = -90;
  const currentRotation = (360 / totalSets) * (currentSetIndex - 1);

  const isPaused = !isActive && !isFinished && !isCountingDown && (currentRep > 1 || currentSetIndex > 1 || progress > 0);
  const isInSession = isActive || isCountingDown || isPaused;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
      {/* ČERVENÝ VRŠEK PRO NOTCH */}
      <SafeAreaView style={{ flex: 0, backgroundColor: '#C0392B' }} />
      
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
            <Text style={styles.headerTitle}>STAMENA</Text>
        </View>

        {/* --- NOVÝ STATUS BAR (STREAKS & POINTS) --- */}
        <View style={styles.statsContainer}>
          {/* BODY + NEXT LEVEL */}
          <View style={styles.statBox}>
             <Text style={styles.statLabel}>POINTS</Text>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 14, marginRight: 2}}>💎</Text>
                <Text style={styles.statValue}>{totalPoints}</Text>
             </View>
             {/* Tady je ten nový malý text */}
             <Text style={styles.statSubText}>Goal: {nextLevelPoints}</Text>
          </View>

          {/* LEVEL */}
          <View style={[styles.statBox, styles.statBoxCenter]}>
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValueBig}>{stamenaLevel}</Text>
          </View>

          {/* STREAK */}
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STREAK</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 14, marginRight: 2}}>{streak > 0 ? '🔥' : '🧊'}</Text>
                <Text style={[styles.statValue, { color: streak > 0 ? '#FF4500' : '#999' }]}>
                    {streak}
                </Text>
            </View>
            {/* Tady může být taky malý text pro motivaci */}
            <Text style={styles.statSubText}>{streak > 0 ? 'Keep it up!' : 'Start today'}</Text>
          </View>
        </View>
        {/* ----------------------------------------- */}

        <View style={styles.centerContent}>
          
          {!isInSession && !isFinished ? (
            <>
              <BounceButton style={styles.startButton} onPress={toggleTimer} scaleTo={0.95}>
                <Text style={styles.startButtonText}>START</Text>
              </BounceButton>
              <Text style={styles.subText}>{totalSets} Sets sequence.</Text>
              <Text style={styles.descText}>Lvl {stamenaLevel} • Get ready.</Text>
            </>
          ) : null}

          {isFinished ? (
            <>
              <BounceButton style={[styles.startButton, styles.restartButton]} onPress={toggleTimer} scaleTo={0.95}>
                <Text style={styles.startButtonText}>AGAIN</Text>
              </BounceButton>
              <Text style={styles.subText}>Good job!</Text>
              <Text style={styles.descText}>Workout Complete.</Text>
            </>
          ) : null}

          {isCountingDown ? (
              <View style={styles.timerWrapper}>
                  <Text style={styles.countdownText}>{countdownValue}</Text>
                  <Text style={styles.subText}>Get Ready...</Text>
              </View>
          ) : null}

          {(isActive || isPaused) && !isCountingDown ? (
            <View style={styles.timerWrapper}>
              
              <TouchableOpacity onPress={toggleTimer} activeOpacity={0.9} style={styles.circlesContainer}>
                  
                  {/* PIZZA KRUH */}
                  <View style={styles.outerCircleContainer}>
                    <Svg width={OUTER_SIZE} height={OUTER_SIZE}>
                      <G rotation={startRotation} origin={`${OUTER_SIZE / 2}, ${OUTER_SIZE / 2}`}>
                        <Circle cx={OUTER_SIZE / 2} cy={OUTER_SIZE / 2} r={OUTER_RADIUS} stroke={trackColor} strokeWidth={OUTER_STROKE} fill="transparent" strokeDasharray={[dashLength, gapLength]} strokeLinecap="butt" />
                        <G rotation={currentRotation} origin={`${OUTER_SIZE / 2}, ${OUTER_SIZE / 2}`}>
                            <Circle cx={OUTER_SIZE / 2} cy={OUTER_SIZE / 2} r={OUTER_RADIUS} stroke={activeColor} strokeWidth={OUTER_STROKE} fill="transparent" strokeDasharray={[dashLength, OUTER_CIRCUMFERENCE - dashLength]} strokeLinecap="butt" />
                        </G>
                      </G>
                    </Svg>
                  </View>

                  {/* VNITŘNÍ KRUH */}
                  <View style={styles.innerCircleContainer}>
                    <Svg width={INNER_SIZE} height={INNER_SIZE}>
                      <G rotation="-90" origin={`${INNER_SIZE / 2}, ${INNER_SIZE / 2}`}>
                        <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_RADIUS} stroke="#F5F5F5" strokeWidth={INNER_STROKE} fill="transparent" />
                        <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_RADIUS} stroke={activeColor} strokeWidth={INNER_STROKE} fill="transparent" strokeDasharray={INNER_CIRCUMFERENCE} strokeDashoffset={INNER_CIRCUMFERENCE - (progress * INNER_CIRCUMFERENCE)} strokeLinecap="round" />
                      </G>
                    </Svg>
                  </View>
                    
                  {/* TEXT UVNITŘ */}
                  <View style={styles.absoluteCenter}>
                        {isPaused ? (
                            <>
                                <Text style={styles.pausedLabel}>PAUSED</Text>
                                {textCues && <Text style={styles.tapToResume}>Tap to Resume</Text>}
                            </>
                        ) : (
                            <>
                                {textCues ? (
                                    <Text style={[styles.circleLabel, {color: activeColor}]}>
                                        {isSqueezing ? (currentSetLabel.includes("Reverse") ? "PUSH OUT" : "SQUEEZE") : "RELAX"}
                                    </Text>
                                ) : (
                                    <View style={{height: 20}} /> 
                                )}
                                
                                <Text style={styles.timerText}>{timeLeft}</Text>
                            </>
                        )}
                  </View>
              </TouchableOpacity>

              <View style={styles.bottomInfo}>
                  <Text style={styles.repText}>Rep {currentRep} / {totalRepsInSet}</Text>
                  
                  {textCues && (
                      <View style={{alignItems: 'center'}}>
                        <Text style={styles.setInfoText}>Set {currentSetIndex} of {totalSets}</Text>
                        <Text style={styles.typeText}>{currentSetLabel}</Text>
                      </View>
                  )}
              </View>

              {/* --- NOVÝ SPODNÍ ŘÁDEK (END vlevo, ČAS vpravo) --- */}
              <View style={styles.bottomControlsRow}>
                
                {/* Tlačítko END (vlevo) */}
                <BounceButton onPress={resetWorkout} style={styles.stopButtonLeft}>
                   <Text style={styles.stopIcon}>⏹️</Text> 
                   <Text style={styles.stopButtonText}>END</Text>
                </BounceButton>

                {/* Total Time (vpravo) - přesunuto sem */}
                <View style={styles.totalTimeRight}>
                  <Text style={styles.totalTimeLabel}>TOTAL TIME</Text>
                  <Text style={styles.totalTimeValue}>{formattedTotalTime}</Text>
                </View>

              </View>
              {/* ------------------------------------------------- */}

            </View>
          ) : null}
          
          {/* POZOR: Tu původní část s {isInSession && ... totalTimeContainer ...} pod tímto blokem úplně SMAŽ! */}

        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#C0392B', height: 50, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontFamily: 'Kanit-Bold', letterSpacing: 1 }, 

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  statBox: { alignItems: 'center', width: width / 3.5 },
  statBoxCenter: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#eee' },
  statLabel: { fontSize: 10, color: '#999', fontFamily: 'Kanit-Bold', marginBottom: 2 }, 
  statValue: { fontSize: 18, fontFamily: 'Kanit-SemiBold', color: '#333' },
  // PŘIDAT TOTO:
  statSubText: {
    fontSize: 10,
    fontFamily: 'Kanit-Regular',
    color: '#999',
    marginTop: 2, // Malá mezera od čísla
  },
  statValueBig: { fontSize: 24, fontFamily: 'Kanit-Bold', color: '#C0392B' },
  
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 }, 
  
  startButton: { backgroundColor: '#333', paddingVertical: 20, paddingHorizontal: 60, borderRadius: 40, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5 },
  restartButton: { backgroundColor: '#27ae60' },
  startButtonText: { color: 'white', fontSize: 20, fontFamily: 'Kanit-Bold', letterSpacing: 2 }, 
  
  //stopButton: { marginTop: 25, padding: 10, alignItems: 'center' },
  stopIcon: { fontSize: 30, marginBottom: 5 },
  stopButtonText: { color: '#999', fontSize: 12, fontFamily: 'Kanit-Bold', letterSpacing: 1 },

  subText: { fontSize: 18, fontFamily: 'Kanit-SemiBold', color: '#333', marginBottom: 5 },
  descText: { fontSize: 14, fontFamily: 'Kanit-Regular', color: '#999' },
  
  countdownText: { fontSize: 120, fontFamily: 'Kanit-Black', color: '#C0392B' },

  timerWrapper: { alignItems: 'center', justifyContent: 'center' },
  circlesContainer: { width: OUTER_SIZE, height: OUTER_SIZE, justifyContent: 'center', alignItems: 'center' },
  outerCircleContainer: { position: 'absolute' },
  innerCircleContainer: { position: 'absolute' },
  absoluteCenter: { position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },

  circleLabel: { fontSize: 24, fontFamily: 'Kanit-Black', textTransform: 'uppercase', marginBottom: 5 },
  timerText: { fontSize: 90, fontFamily: 'Kanit-Black', color: '#333', lineHeight: 95 }, 
  pausedLabel: { fontSize: 30, fontFamily: 'Kanit-Bold', color: '#333', letterSpacing: 1 },
  tapToResume: { fontSize: 14, fontFamily: 'Kanit-Regular', color: '#999', marginTop: 10 },

  bottomInfo: { marginTop: 40, alignItems: 'center', height: 80 },
  // --- NOVÉ STYLY PRO SPODNÍ ŘÁDEK ---
  bottomControlsRow: {
    flexDirection: 'row',       // Dát vedle sebe
    justifyContent: 'space-between', // Roztáhnout do krajů
    alignItems: 'flex-end',     // Zarovnat na spodek
    width: '100%',
    paddingHorizontal: 30,      // Odsazení od krajů obrazovky
    marginTop: 10,
  },

  stopButtonLeft: {
    alignItems: 'center',       // Ikona a text na střed sebe
    // Už žádný marginTop, řídí to řádek
  },

  totalTimeRight: {
    alignItems: 'flex-end',     // Text zarovnat doprava
    // Už žádné position: 'absolute'
  },
  repText: { fontSize: 20, fontFamily: 'Kanit-Bold', color: '#333' },
  setInfoText: { fontSize: 16, fontFamily: 'Kanit-Regular', color: '#999', marginTop: 10 },
  typeText: { fontSize: 22, fontFamily: 'Kanit-Bold', color: '#C0392B', marginTop: 2 }, 

  //totalTimeContainer: { position: 'absolute', bottom: 110, right: 30, alignItems: 'flex-end' },
  totalTimeLabel: { fontSize: 10, color: '#999', fontFamily: 'Kanit-Bold', textTransform: 'uppercase' },
  totalTimeValue: { fontSize: 20, color: '#333', fontFamily: 'Kanit-SemiBold', fontVariant: ['tabular-nums'] }
});

export default HomeScreen;