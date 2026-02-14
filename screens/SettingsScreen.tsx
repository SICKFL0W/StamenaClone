import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, 
  SafeAreaView, StatusBar, Alert, Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as Notifications from 'expo-notifications'; 
import { useSettings } from '../SettingsContext';

const APP_FONT = 'Kanit-Regular'; 
const APP_FONT_BOLD = 'Kanit-Bold'; 

// UNIFIKOVANÝ FONT (STEJNÉ JAKO HOME)
const HEADER_TITLE_SIZE = 22;
const HEADER_HEIGHT = 55;

const SettingsScreen = () => {
  const { 
    textCues, setTextCues,
    vibrationCues, setVibrationCues,
    audioCues, setAudioCues,
    workoutNotifs, setWorkoutNotifs,
    pointNotifs, setPointNotifs,
    reminders, addReminder, removeReminder, updateReminderTime,
    stamenaLevel, setStamenaLevel,
    godMode, setGodMode,
    notifTitle, setNotifTitle,
    notifBody, setNotifBody
  } = useSettings();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeReminderIndex, setActiveReminderIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const [showTextEditor, setShowTextEditor] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempBody, setTempBody] = useState("");

  // --- HANDLERS ---
  const decreaseLevel = () => {
    if (!godMode) { Alert.alert("Locked", "Turn on God Mode to change levels manually."); return; }
    if (stamenaLevel > 1) setStamenaLevel(stamenaLevel - 1);
  };

  const increaseLevel = () => {
    if (!godMode) { Alert.alert("Locked", "Turn on God Mode to change levels manually."); return; }
    if (stamenaLevel < 20) setStamenaLevel(stamenaLevel + 1);
  };

  const handleTimePress = (index: number, date: Date) => {
    setActiveReminderIndex(index); setTempDate(new Date(date)); setShowTimePicker(true);
  };

  const saveTime = () => {
    if (activeReminderIndex !== null) updateReminderTime(activeReminderIndex, tempDate);
    setShowTimePicker(false);
  };

  const handleDeleteReminder = () => {
    if (activeReminderIndex !== null) {
        Alert.alert("Delete Reminder", "Are you sure you want to remove this reminder?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => { removeReminder(activeReminderIndex); setShowTimePicker(false); } }
        ]);
    }
  };

  const openTextEditor = () => { setTempTitle(notifTitle); setTempBody(notifBody); setShowTextEditor(true); };
  const saveTextEditor = () => { setNotifTitle(tempTitle); setNotifBody(tempBody); setShowTextEditor(false); };
  const resetTextToDefault = () => { setTempTitle("Time to Grind! 💪"); setTempBody("Don't break the chain. Your daily workout is waiting."); };
  
  const previewNotification = async () => {
      await Notifications.scheduleNotificationAsync({
        content: { title: tempTitle, body: tempBody, sound: true },
        trigger: null, 
      });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
      
      {/* 1. FIXNÍ ČERVENÁ ČÁST PRO NOTCH (Sjednoceno s Home) */}
      <SafeAreaView style={{ flex: 0, backgroundColor: '#C0392B' }} />
      
      {/* 2. HLAVNÍ KONTEJNER */}
      <SafeAreaView style={styles.contentSafeArea}>
        
        {/* UNIFIKOVANÁ HLAVIČKA */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* WORKOUTS SECTION */}
          <Text style={styles.sectionHeader}>WORKOUTS</Text>
          <View style={styles.section}>
            <SettingsRow label="God Mode ⚡️" isSwitch value={godMode} onValueChange={setGodMode} />
            <SettingsSeparator />
            <View style={styles.row}>
               <Text style={[styles.rowLabel, { color: godMode ? '#000' : '#8E8E93' }]}>Stamena Level</Text>
               <View style={styles.stepperContainer}>
                  <TouchableOpacity onPress={decreaseLevel} style={[styles.stepperButton, { opacity: godMode ? 1 : 0.5 }]} disabled={!godMode}><Text style={styles.stepperIcon}>-</Text></TouchableOpacity>
                  <View style={styles.levelValueContainer}><Text style={[styles.levelValueText, { color: godMode ? '#000' : '#8E8E93' }]}>{stamenaLevel < 10 ? `0${stamenaLevel}` : stamenaLevel}</Text></View>
                  <TouchableOpacity onPress={increaseLevel} style={[styles.stepperButton, { opacity: godMode ? 1 : 0.5 }]} disabled={!godMode}><Text style={styles.stepperIcon}>+</Text></TouchableOpacity>
               </View>
            </View>
            <SettingsSeparator />
            <SettingsRow label="Text Cues" isSwitch value={textCues} onValueChange={setTextCues} />
            <SettingsSeparator />
            <SettingsRow label="Vibration Cues" isSwitch value={vibrationCues} onValueChange={setVibrationCues} />
            <SettingsSeparator />
            <SettingsRow label="Audio Cues" isSwitch lastItem value={audioCues} onValueChange={setAudioCues} />
          </View>

          {/* NOTIFICATIONS SECTION */}
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.section}>
             <SettingsRow label="Workout Notifications" isSwitch value={workoutNotifs} onValueChange={setWorkoutNotifs} />
             <SettingsSeparator />
             <SettingsRow label="Notification Message" value="Customize" hasArrow onPress={openTextEditor} disabled={!workoutNotifs} />
             <SettingsSeparator />
             <SettingsRow label="Streak Updates" isSwitch lastItem value={pointNotifs} onValueChange={setPointNotifs} />
          </View>
          <Text style={styles.footerText}>Keep your streak alive! Missing a day resets it to zero.</Text>

          {/* REMINDERS SECTION */}
          <Text style={styles.sectionHeader}>WORKOUT REMINDERS</Text>
          <View style={styles.section}>
            {reminders.map((date, index) => (
              <View key={index}>
                  <SettingsRow label={`Reminder ${index + 1}`} value={formatTime(date)} hasArrow onPress={() => handleTimePress(index, date)} />
                  <SettingsSeparator />
              </View>
            ))}
            <TouchableOpacity style={styles.addRow} onPress={addReminder} activeOpacity={0.7}>
              <Text style={styles.addRowText}>+ Add Reminder</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* MODALS */}
      <Modal visible={showTimePicker} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
                <View style={styles.modalToolbar}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}><Text style={styles.modalCancelButton}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.modalTitle}>Set Time</Text>
                    <TouchableOpacity onPress={saveTime}><Text style={styles.modalDoneButton}>Save</Text></TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker value={tempDate} mode="time" display="spinner" onChange={(event, selectedDate) => { if (selectedDate) setTempDate(selectedDate); }} textColor="black" locale="en_GB" />
                </View>
                <TouchableOpacity style={styles.deleteButtonContainer} onPress={handleDeleteReminder}><Text style={styles.deleteButtonText}>Remove Reminder</Text></TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTextEditor} animationType="slide" presentationStyle="pageSheet">
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <View style={styles.editorContainer}>
                <View style={styles.editorHeader}>
                    <TouchableOpacity onPress={() => setShowTextEditor(false)}><Text style={styles.modalCancelButton}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.modalTitle}>Edit Message</Text>
                    <TouchableOpacity onPress={saveTextEditor}><Text style={styles.modalDoneButton}>Save</Text></TouchableOpacity>
                </View>
                <ScrollView style={{flex: 1, padding: 20}}>
                    <Text style={styles.inputLabel}>NOTIFICATION TITLE</Text>
                    <TextInput style={styles.textInput} value={tempTitle} onChangeText={setTempTitle} placeholder="e.g. Time to Grind!" placeholderTextColor="#C7C7CC" maxLength={50} />
                    <Text style={styles.inputLabel}>NOTIFICATION BODY</Text>
                    <TextInput style={[styles.textInput, { height: 80, paddingTop: 12 }]} value={tempBody} onChangeText={setTempBody} placeholder="e.g. Don't break the streak..." placeholderTextColor="#C7C7CC" multiline maxLength={150} textAlignVertical="top" />
                    <View style={{marginTop: 30}}>
                        <TouchableOpacity style={styles.previewButton} onPress={previewNotification}><Text style={styles.previewButtonText}>Test Preview 🔔</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.resetButton} onPress={resetTextToDefault}><Text style={styles.resetButtonText}>Reset to Default</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.editorFooterText}>This message will be used for your daily reminders.</Text>
                </ScrollView>
            </View>
         </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

// --- HELPER COMPONENTS ---
const SettingsRow = ({ label, value, isSwitch, hasArrow, lastItem, onValueChange, onPress, disabled, valueColor }: any) => (
  <TouchableOpacity style={[styles.row, disabled && styles.rowDisabled]} disabled={isSwitch || disabled} onPress={onPress} activeOpacity={0.6}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      {value !== undefined && !isSwitch && (<Text style={[styles.rowValue, { color: valueColor || '#8E8E93' }]}>{value}</Text>)}
      {hasArrow && <Text style={styles.arrow}>›</Text>}
      {isSwitch && (<Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#767577", true: "#34C759" }} style={{ transform: [{ scaleX: .9 }, { scaleY: .9 }] }} />)}
    </View>
  </TouchableOpacity>
);
const SettingsSeparator = () => (<View style={styles.separatorContainer}><View style={styles.separator} /></View>);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F2F2F7' }, 
  contentSafeArea: { flex: 1, backgroundColor: '#F2F2F7' }, // Aby settings měly šedé pozadí

  // UNIFIKOVANÉ STYLY HLAVIČKY (SHODNÉ S HOME)
  header: { 
    backgroundColor: '#C0392B', 
    height: HEADER_HEIGHT, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10
  },
  headerTitle: { 
    color: 'white', 
    fontSize: HEADER_TITLE_SIZE, 
    fontFamily: APP_FONT_BOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  
  scrollView: { flex: 1 },
  sectionHeader: { fontSize: 13, color: '#6D6D72', marginBottom: 6, marginLeft: 16, marginTop: 24, textTransform: 'uppercase', fontFamily: APP_FONT },
  section: { backgroundColor: 'white', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#C6C6C8' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44, paddingHorizontal: 16, backgroundColor: 'white' },
  rowDisabled: { opacity: 0.5 },
  separatorContainer: { backgroundColor: 'white', paddingLeft: 16 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8' },
  rowLabel: { fontSize: 17, color: 'black', fontFamily: APP_FONT },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 17, marginRight: 6, fontFamily: APP_FONT },
  arrow: { fontSize: 22, color: '#C7C7CC', marginTop: -2, marginLeft: 2, fontFamily: APP_FONT },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E5EA', borderRadius: 8, padding: 2 },
  stepperButton: { width: 32, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
  stepperIcon: { fontSize: 18, fontWeight: '600', color: '#000', marginTop: -2 },
  levelValueContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
  levelValueText: { fontSize: 17, fontFamily: APP_FONT_BOLD },
  addRow: { height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  addRowText: { color: '#007AFF', fontSize: 17, fontFamily: APP_FONT },
  footerText: { fontSize: 13, color: '#6D6D72', paddingHorizontal: 16, paddingTop: 8, textAlign: 'left', fontFamily: APP_FONT },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingBottom: 30 },
  modalToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#C6C6C8', backgroundColor: '#f9f9f9', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  modalTitle: { fontSize: 17, fontFamily: APP_FONT_BOLD },
  modalDoneButton: { color: '#007AFF', fontSize: 17, fontFamily: APP_FONT_BOLD },
  modalCancelButton: { color: '#007AFF', fontSize: 17, fontFamily: APP_FONT },
  pickerContainer: { backgroundColor: 'white', marginBottom: 20 },
  deleteButtonContainer: { backgroundColor: 'white', height: 44, justifyContent: 'center', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#C6C6C8' },
  deleteButtonText: { color: '#FF3B30', fontSize: 17, fontFamily: APP_FONT },

  editorContainer: { flex: 1, backgroundColor: '#F2F2F7', marginTop: 20 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 50, backgroundColor: '#F2F2F7', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#C6C6C8' },
  inputLabel: { fontSize: 13, color: '#6D6D72', marginBottom: 6, marginLeft: 16, marginTop: 24, textTransform: 'uppercase', fontFamily: APP_FONT },
  textInput: { backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 16, height: 44, fontSize: 17, color: 'black', fontFamily: APP_FONT },
  previewButton: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#007AFF' },
  previewButtonText: { color: '#007AFF', fontSize: 17, fontFamily: APP_FONT_BOLD },
  resetButton: { paddingVertical: 12, alignItems: 'center' },
  resetButtonText: { color: '#FF3B30', fontSize: 17, fontFamily: APP_FONT },
  editorFooterText: { fontSize: 13, color: '#6D6D72', paddingHorizontal: 16, paddingTop: 8, textAlign: 'center', fontFamily: APP_FONT }
});

export default SettingsScreen;