import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Průhlednost celé obrazovky
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Pulzování loga

  useEffect(() => {
    // 1. Animace loga (zvětšení)
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // 2. Počkáme 2 sekundy (simulace loadingu / brandingu) a pak zmizíme
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // Půl sekundy fade out
        useNativeDriver: true,
      }).start(() => {
        onFinish(); // Řekneme App.tsx, že jsme hotovi
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={styles.logoText}>Stamena</Text>
        <Text style={styles.subText}>KEGEL TRAINER</Text>
      </Animated.View>
      
      {/* Loading indikátor dole (volitelné, ale vypadá to profi) */}
      <View style={styles.loadingBarContainer}>
          <View style={styles.loadingBar} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Roztáhne se přes celou obrazovku
    backgroundColor: '#C0392B', // Stamena červená
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Musí být nade vším
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 4,
    fontWeight: '600',
  },
  loadingBarContainer: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.4,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: 0.8,
  }
});