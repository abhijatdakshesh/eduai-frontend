import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';

const AdminBulkImportScreen = () => {
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = (type) => {
    const headers = {
      users: ['first_name','last_name','email','role'],
      classes: ['name','grade_level','room_id','teacher_id'],
    }[type];
    if (!headers) return;
    if (Platform.OS !== 'web') {
      Alert.alert('Template', 'Download available on web.');
      return;
    }
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadCsv = (type) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Upload', 'CSV upload supported on web in this demo.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      setUploading(true);
      // TODO: send to backend `/admin/${type}/import`
      setTimeout(() => {
        setUploading(false);
        Alert.alert('Bulk Import', `${type} CSV uploaded (demo).`);
      }, 1200);
    };
    input.click();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Import</Text>
        <Text style={styles.headerSubtitle}>Import users and classes via CSV</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => downloadTemplate('users')}>
            <Text style={styles.btnText}>Download Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => uploadCsv('users')} disabled={uploading}>
            <Text style={styles.btnText}>{uploading ? 'Uploading...' : 'Upload CSV'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classes</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => downloadTemplate('classes')}>
            <Text style={styles.btnText}>Download Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => uploadCsv('classes')} disabled={uploading}>
            <Text style={styles.btnText}>{uploading ? 'Uploading...' : 'Upload CSV'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  headerSubtitle: { color: '#e3f2fd' },
  section: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { color: '#1a237e', fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row' },
  btn: { backgroundColor: '#6b7280', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  primary: { backgroundColor: '#1a237e' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default AdminBulkImportScreen;


