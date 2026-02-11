import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, 
  SafeAreaView, StatusBar, Alert, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { useSettings } from '../SettingsContext';

const APP_FONT = 'Kanit-Regular'; 
const APP_FONT_BOLD = 'Kanit-Regular'; 

const SettingsScreen = () => {
  const { 
    textCues, setTextCues,
    vibrationCues, setVibrationCues,
    audioCues, setAudioCues,
    workoutNotifs, setWorkoutNotifs,
    pointNotifs, setPointNotifs,
    reminders, addReminder, removeReminder, updateReminderTime,
    stamenaLevel, setStamenaLevel,
    godMode, setGodMode
  } = useSettings();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeReminderIndex, setActiveReminderIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  // --- HANDLERS ---

  // Logika pro tlačítka +/-
  const decreaseLevel = () => {
    if (!godMode) {
        Alert.alert("Locked", "Turn on God Mode to change levels manually.");
        return;
    }
    if (stamenaLevel > 1) setStamenaLevel(stamenaLevel - 1);
  };

  const increaseLevel = () => {
    if (!godMode) {
        Alert.alert("Locked", "Turn on God Mode to change levels manually.");
        return;
    }
    if (stamenaLevel < 20) setStamenaLevel(stamenaLevel + 1);
  };

  const handleTimePress = (index: number, date: Date) => {
    setActiveReminderIndex(index);
    setTempDate(new Date(date)); 
    setShowTimePicker(true);
  };

  const saveTime = () => {
    if (activeReminderIndex !== null) {
      updateReminderTime(activeReminderIndex, tempDate);
    }
    setShowTimePicker(false);
  };

  const handleDeleteReminder = () => {
    if (activeReminderIndex !== null) {
        Alert.alert(
            "Delete Reminder",
            "Are you sure you want to remove this reminder?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => {
                        removeReminder(activeReminderIndex);
                        setShowTimePicker(false);
                    }
                }
            ]
        );
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
      
      {/* HEADER */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* WORKOUTS SECTION */}
        <Text style={styles.sectionHeader}>WORKOUTS</Text>
        <View style={styles.section}>
          
          <SettingsRow 
            label="God Mode ⚡️" 
            isSwitch 
            value={godMode} 
            onValueChange={setGodMode} 
          />
          
          <SettingsSeparator />
          
          {/* VLASTNÍ ŘÁDEK PRO LEVEL (STEPPER) */}
          <View style={styles.row}>
             <Text style={[styles.rowLabel, { color: godMode ? '#000' : '#8E8E93' }]}>
                Stamena Level
             </Text>
             
             <View style={styles.stepperContainer}>
                {/* Tlačítko MÍNUS */}
                <TouchableOpacity 
                    onPress={decreaseLevel} 
                    style={[styles.stepperButton, { opacity: godMode ? 1 : 0.5 }]}
                    disabled={!godMode}
                >
                    <Text style={styles.stepperIcon}>-</Text>
                </TouchableOpacity>

                {/* Hodnota */}
                <View style={styles.levelValueContainer}>
                    <Text style={[styles.levelValueText, { color: godMode ? '#000' : '#8E8E93' }]}>
                        {stamenaLevel < 10 ? `0${stamenaLevel}` : stamenaLevel}
                    </Text>
                </View>

                {/* Tlačítko PLUS */}
                <TouchableOpacity 
                    onPress={increaseLevel} 
                    style={[styles.stepperButton, { opacity: godMode ? 1 : 0.5 }]}
                    disabled={!godMode}
                >
                    <Text style={styles.stepperIcon}>+</Text>
                </TouchableOpacity>
             </View>
          </View>

          <SettingsSeparator />
          
          <SettingsRow 
            label="Text Cues" 
            isSwitch 
            value={textCues} 
            onValueChange={setTextCues} 
          />
          <SettingsSeparator />
          <SettingsRow 
            label="Vibration Cues" 
            isSwitch 
            value={vibrationCues} 
            onValueChange={setVibrationCues} 
          />
          <SettingsSeparator />
          <SettingsRow 
            label="Audio Cues" 
            isSwitch 
            lastItem 
            value={audioCues} 
            onValueChange={setAudioCues} 
          />
        </View>

        {/* NOTIFICATIONS SECTION */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.section}>
           <SettingsRow 
            label="Workout Notifications" 
            isSwitch 
            value={workoutNotifs} 
            onValueChange={setWorkoutNotifs} 
           />
           <SettingsSeparator />
           <SettingsRow 
            label="Point Notifications" 
            isSwitch 
            lastItem 
            value={pointNotifs} 
            onValueChange={setPointNotifs} 
           />
        </View>
        <Text style={styles.footerText}>Your points will decay if you miss a workout.</Text>

        {/* REMINDERS SECTION */}
        <Text style={styles.sectionHeader}>WORKOUT REMINDERS</Text>
        <View style={styles.section}>
          {reminders.map((date, index) => (
            <View key={index}>
                <SettingsRow 
                  label={`Reminder ${index + 1}`} 
                  value={formatTime(date)} 
                  hasArrow 
                  onPress={() => handleTimePress(index, date)}
                />
                <SettingsSeparator />
            </View>
          ))}
          
          <TouchableOpacity style={styles.addRow} onPress={addReminder} activeOpacity={0.7}>
            <Text style={styles.addRowText}>+ Add Reminder</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* TIME PICKER MODAL (EDIT & DELETE) */}
      <Modal visible={showTimePicker} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
                <View style={styles.modalToolbar}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                        <Text style={styles.modalCancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Set Time</Text>
                    <TouchableOpacity onPress={saveTime}>
                        <Text style={styles.modalDoneButton}>Save</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) setTempDate(selectedDate);
                    }}
                    textColor="black"
                    locale="en_GB" 
                  />
                </View>

                {/* DELETE BUTTON */}
                <TouchableOpacity style={styles.deleteButtonContainer} onPress={handleDeleteReminder}>
                    <Text style={styles.deleteButtonText}>Remove Reminder</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

// --- HELPER COMPONENTS ---

const SettingsRow = ({ label, value, isSwitch, hasArrow, lastItem, onValueChange, onPress, disabled, valueColor }: any) => (
  <TouchableOpacity 
    style={[styles.row, disabled && styles.rowDisabled]} 
    disabled={isSwitch || disabled} 
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      {value !== undefined && !isSwitch && (
        <Text style={[styles.rowValue, { color: valueColor || '#8E8E93' }]}>{value}</Text>
      )}
      {hasArrow && <Text style={styles.arrow}>›</Text>}
      {isSwitch && (
        <Switch 
            value={value} 
            onValueChange={onValueChange} 
            trackColor={{ false: "#767577", true: "#34C759" }} 
            style={{ transform: [{ scaleX: .9 }, { scaleY: .9 }] }}
        />
      )}
    </View>
  </TouchableOpacity>
);

const SettingsSeparator = () => (
    <View style={styles.separatorContainer}>
        <View style={styles.separator} />
    </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F2F2F7' }, 
  headerSafeArea: { backgroundColor: '#C0392B' },
  header: { 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#C0392B' 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontFamily: APP_FONT_BOLD
  },
  scrollView: { flex: 1 },
  
  // Section Styles
  sectionHeader: { 
    fontSize: 13, 
    color: '#6D6D72', 
    marginBottom: 6, 
    marginLeft: 16, 
    marginTop: 24, 
    textTransform: 'uppercase',
    fontFamily: APP_FONT 
  },
  section: { 
    backgroundColor: 'white', 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderColor: '#C6C6C8' 
  },
  
  // Row Styles
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    height: 44, 
    paddingHorizontal: 16, 
    backgroundColor: 'white' 
  },
  rowDisabled: {
    opacity: 0.5
  },
  separatorContainer: {
    backgroundColor: 'white',
    paddingLeft: 16
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  rowLabel: { 
    fontSize: 17, 
    color: 'black',
    fontFamily: APP_FONT 
  },
  rowRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  rowValue: { 
    fontSize: 17, 
    marginRight: 6,
    fontFamily: APP_FONT 
  },
  arrow: { 
    fontSize: 22, 
    color: '#C7C7CC', 
    marginTop: -2,
    marginLeft: 2,
    fontFamily: APP_FONT 
  },

  // Stepper Styles (Level +/-)
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA', // Jemně šedé pozadí pro stepper
    borderRadius: 8,
    padding: 2,
  },
  stepperButton: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Bílá tlačítka
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  stepperIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: -2, 
  },
  levelValueContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelValueText: {
    fontSize: 17,
    fontFamily: APP_FONT_BOLD,
  },
  
  // Add Button
  addRow: { 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  addRowText: { 
    color: '#007AFF', 
    fontSize: 17, 
    fontFamily: APP_FONT 
  },
  
  footerText: { 
    fontSize: 13, 
    color: '#6D6D72', 
    paddingHorizontal: 16, 
    paddingTop: 8,
    textAlign: 'left',
    fontFamily: APP_FONT 
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  modalContent: { 
    backgroundColor: '#F2F2F7', 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12, 
    paddingBottom: 30 
  },
  modalToolbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 16, 
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderColor: '#C6C6C8', 
    backgroundColor: '#f9f9f9', 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12, 
  },
  modalTitle: {
      fontSize: 17,
      fontFamily: APP_FONT_BOLD 
  },
  modalDoneButton: { 
    color: '#007AFF', 
    fontSize: 17,
    fontFamily: APP_FONT_BOLD 
  },
  modalCancelButton: { 
    color: '#007AFF', 
    fontSize: 17,
    fontFamily: APP_FONT 
  },
  pickerContainer: {
      backgroundColor: 'white',
      marginBottom: 20
  },
  
  // Delete Button in Modal
  deleteButtonContainer: {
      backgroundColor: 'white',
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: '#C6C6C8'
  },
  deleteButtonText: {
      color: '#FF3B30', 
      fontSize: 17,
      fontFamily: APP_FONT 
  }
});

export default SettingsScreen;