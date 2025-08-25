import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const isIOS = Platform.OS === 'ios';

const ParentLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const resp = await login(email.trim(), password);
      if (!resp?.success) {
        Alert.alert('Error', resp?.message || 'Login failed');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parent Portal</Text>
        <Text style={styles.subtitle}>Sign in to view your child’s progress</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} disabled={loading} onPress={handleLogin}>
          <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In as Parent'}</Text>
        </TouchableOpacity>

        <View style={styles.quickFillRow}>
          <Text style={styles.quickFillLabel}>Quick fill:</Text>
          <TouchableOpacity style={styles.quickFillChip} onPress={() => { setEmail('testparent@school.com'); setPassword('password123'); }}>
            <Text style={styles.quickFillChipText}>Parent</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: isIOS ? 32 : 28, fontWeight: 'bold', color: '#1a237e', marginBottom: 8 },
  subtitle: { fontSize: isIOS ? 16 : 14, color: '#666' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  label: { fontSize: isIOS ? 16 : 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb', fontSize: isIOS ? 16 : 14 },
  btn: { backgroundColor: '#1a237e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 18 : 16 },
  back: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: '#6b7280', fontWeight: '500' },
  quickFillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  quickFillLabel: { color: '#6b7280', fontSize: 12, marginRight: 8 },
  quickFillChip: { backgroundColor: '#e3f2fd', borderColor: '#90caf9', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginHorizontal: 4 },
  quickFillChipText: { color: '#1a237e', fontSize: 12, fontWeight: '600' },
});

export default ParentLoginScreen;


