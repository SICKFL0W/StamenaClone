import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';

const InstructionsScreen = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
      {/* 1. ČERVENÝ VRŠEK PRO NOTCH */}
      <SafeAreaView style={{ flex: 0, backgroundColor: '#C0392B' }} />

      {/* 2. ZBYTEK (Šedé pozadí pro kontrast karet) */}
      <SafeAreaView style={styles.container}>
        
        <View style={styles.header}>
          {/* Změněno na Kanit a bílou barvu */}
          <Text style={styles.headerTitle}>HOW TO MASTER IT</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* KARTA 1 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. The Regular Kegel</Text>
            <Text style={styles.analogy}>"Stop Pissing"</Text>
            <Text style={styles.text}>
              Imagine you are urinating and someone walks in. You have to stop the flow immediately. 
              That squeeze? That is your PC Muscle.
            </Text>
            <Text style={styles.bullet}>• Action: Squeeze & Lift inwards.</Text>
            <Text style={styles.bullet}>• Benefit: Harder erections, ejaculation control.</Text>
          </View>

          {/* KARTA 2 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. The Reverse Kegel</Text>
            <Text style={styles.analogy}>"Piss Faster"</Text>
            <Text style={styles.text}>
              Imagine you want to force the urine out faster, or you are trying to push out a fart. 
              You are relaxing and pushing the pelvic floor OUT.
            </Text>
            <Text style={styles.bullet}>• Action: Relax & Push outwards.</Text>
            <Text style={styles.bullet}>• Benefit: Lasting longer, preventing pain.</Text>
          </View>

          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why do I need both?</Text>
            <Text style={styles.infoText}>
              If you only do Regular Kegels, your muscle gets tight and short (like a cramp). 
              This can actually cause premature finishing. 
              You need Reverse Kegels to balance it out and gain full control.
            </Text>
          </View>

           <View style={{height: 50}} /> 
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  
  // Header upraven na červenou
  header: { 
    padding: 15, 
    backgroundColor: '#C0392B', 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5
  },
  headerTitle: { 
    fontSize: 20, 
    fontFamily: 'Kanit-Bold', // Použijeme náš font
    color: '#fff',            // Bílá barva na červeném
    letterSpacing: 1
  },
  
  content: { padding: 20 },
  
  // Karty
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 3 
  },
  cardTitle: { 
    fontSize: 18, 
    fontFamily: 'Kanit-Bold', 
    color: '#C0392B', 
    marginBottom: 5 
  },
  analogy: { 
    fontSize: 24, 
    fontFamily: 'Kanit-Black', // Extra tučné pro "Stop Pissing"
    color: '#333', 
    marginBottom: 10, 
    fontStyle: 'italic' 
  },
  text: { 
    fontSize: 16, 
    fontFamily: 'Kanit-Regular',
    color: '#555',
    lineHeight: 24, 
    marginBottom: 10 
  },
  bullet: { 
    fontSize: 15, 
    color: '#333', 
    fontFamily: 'Kanit-SemiBold', 
    marginTop: 4 
  },
  
  // Info Box (Zelený)
  infoBox: { 
    backgroundColor: '#E8F6F3', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 40, 
    borderColor: '#27ae60', 
    borderWidth: 1 
  },
  infoTitle: { 
    fontSize: 18, 
    fontFamily: 'Kanit-Bold', 
    color: '#27ae60', 
    marginBottom: 8 
  },
  infoText: { 
    fontSize: 15, 
    fontFamily: 'Kanit-Regular',
    color: '#2c3e50', 
    lineHeight: 22 
  }
});

export default InstructionsScreen;