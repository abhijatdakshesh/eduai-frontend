import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';

const TeacherQRCheckInScreen = () => {
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    if (Platform.OS === 'web') {
      Alert.alert('QR Check-In', 'QR scanning is not available on web demo.');
      return;
    }
    setScanning(true);
    // TODO: integrate expo-barcode-scanner or camera; stub for now
    setTimeout(() => {
      setScanning(false);
      Alert.alert('QR Check-In', 'Scanned: Student ID 123456 checked in.');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Check-In</Text>
      <Text style={styles.subtitle}>Scan student QR codes to mark presence quickly.</Text>
      <TouchableOpacity style={styles.button} onPress={startScan} disabled={scanning}>
        <Text style={styles.buttonText}>{scanning ? 'Scanning...' : 'Start Scan'}</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Tip: Use reason codes on the Mark Attendance screen for exceptions.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a237e', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#374151', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: 'white', fontWeight: '700' },
  hint: { marginTop: 16, color: '#6b7280', fontSize: 12, textAlign: 'center' },
});

export default TeacherQRCheckInScreen;


