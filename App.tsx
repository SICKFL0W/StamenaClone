import React, { useState } from 'react'; // <--- TADY JSME PŘIDALI useState
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importy obrazovek
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import InstructionsScreen from './screens/InstructionsScreen'; 
import { SettingsProvider } from './SettingsContext';

// NOVÝ IMPORT (Ujisti se, že jsi vytvořil soubor SplashScreen.tsx ve složce screens!)
import { SplashScreen } from './screens/SplashScreen';

const Tab = createBottomTabNavigator();

// --- PROSTŘEDNÍ TLAČÍTKO (Bulva) ---
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20, 
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={{
      width: 64,  
      height: 64,
      borderRadius: 32,
      backgroundColor: '#C0392B', 
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,      // Tlustší bílý okraj pro lepší oddělení
      borderColor: '#ffffff', 
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function App() {
  // --- 1. STAV APLIKACE (Zatím není připravena, ukaž Splash) ---
  const [isAppReady, setIsAppReady] = useState(false);

  return (
    <SettingsProvider>
      
      {/* --- 2. LOGIKA SPLASH SCREENU --- */}
      {/* Pokud aplikace není ready, zobrazíme Splash Screen přes všechno ostatní */}
      {!isAppReady && (
        <SplashScreen onFinish={() => setIsAppReady(true)} />
      )}

      {/* --- 3. HLAVNÍ APLIKACE --- */}
      <NavigationContainer>
        <Tab.Navigator
        initialRouteName="Exercise"
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              height: Platform.OS === 'ios' ? 90 : 70, // Trochu vyšší pro pohodlí
              borderTopWidth: 0, 
              paddingTop: 10,
              
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 10,
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20,
            }
          }}
        >
          {/* 1. INSTRUKCE (Vlevo) */}
          <Tab.Screen 
            name="Instructions" 
            component={InstructionsScreen} 
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.4 }]}>
                  {/* Vráceno emoji papíru */}
                  <Text style={styles.iconText}>📄</Text>
                  <Text style={[
                    styles.iconLabel, 
                    { color: focused ? '#C0392B' : '#000' } // Červená když aktivní, černá (vybledlá) když ne
                  ]}>
                    INFO
                  </Text>
                </View>
              ),
            }}
          />

          {/* 2. CVIČENÍ (Prostřední bulva) */}
          <Tab.Screen 
            name="Exercise" 
            component={HomeScreen} 
            options={{
              tabBarIcon: ({ focused }) => (
                <Text style={{fontSize: 30, marginBottom: 2}}>💪</Text>
              ),
              tabBarButton: (props) => (
                <CustomTabBarButton {...props}>
                  <Text style={{fontSize: 30, marginBottom: 2}}>💪</Text>
                </CustomTabBarButton>
              )
            }}
          />

          {/* 3. SETTINGS (Vpravo) */}
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.4 }]}>
                  <Text style={styles.iconText}>⚙️</Text>
                  <Text 
                    style={[
                      styles.iconLabel, 
                      { color: focused ? '#C0392B' : '#000' }
                    ]}
                    numberOfLines={1} // Zabrání zalomení textu
                  >
                    SETTINGS
                  </Text>
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60, // Fixní šířka, aby se text necentroval divně
  },
  iconText: {
    fontSize: 24, // Trochu menší ikona pro eleganci
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 10, // Menší font, aby se vešlo "SETTINGS"
    fontWeight: '700', // Tučné písmo pro čitelnost
  }
});