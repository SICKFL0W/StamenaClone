import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ScreenOrientation from 'expo-screen-orientation'; 
import * as Notifications from 'expo-notifications'; 

// Importy obrazovek
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import InstructionsScreen from './screens/InstructionsScreen'; 
import { SettingsProvider } from './SettingsContext';
import { SplashScreen } from './screens/SplashScreen';

// --- NASTAVENÍ NOTIFIKACÍ ---
// Oprava chyby: Musíme definovat všechny vlastnosti chování
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // <--- PŘIDÁNO (Oprava TS chyby)
    shouldShowList: true,   // <--- PŘIDÁNO (Oprava TS chyby)
  }),
});

const Tab = createBottomTabNavigator();

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
      borderWidth: 4,
      borderColor: '#ffffff', 
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  // --- ZÁMEK ORIENTACE NA PORTRAIT ---
  useEffect(() => {
    async function lockOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    lockOrientation();
  }, []);

  return (
    <SettingsProvider>
      {!isAppReady && (
        <SplashScreen onFinish={() => setIsAppReady(true)} />
      )}

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
              height: Platform.OS === 'ios' ? 90 : 70, 
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
          <Tab.Screen 
            name="Instructions" 
            component={InstructionsScreen} 
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.4 }]}>
                  <Text style={styles.iconText}>📄</Text>
                  <Text style={[styles.iconLabel, { color: focused ? '#C0392B' : '#000' }]}>INFO</Text>
                </View>
              ),
            }}
          />

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

          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.4 }]}>
                  <Text style={styles.iconText}>⚙️</Text>
                  <Text style={[styles.iconLabel, { color: focused ? '#C0392B' : '#000' }]} numberOfLines={1}>SETTINGS</Text>
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
    width: 60, 
  },
  iconText: {
    fontSize: 24, 
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 10, 
    fontWeight: '700', 
  }
});