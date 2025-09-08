import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentChildrenScreen = ({ navigation, route }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      console.log('ParentChildren: Starting to load children...');
      
      // Add cache-busting timestamp to force fresh data
      const cacheBuster = `?t=${Date.now()}`;
      console.log('ParentChildren: Using cache buster:', cacheBuster);
      
      const resp = await apiClient.getParentChildren();
      console.log('ParentChildren: API response:', resp);
      
      if (resp?.success) {
        const childrenData = resp.data?.children || [];
        console.log('ParentChildren: Setting children:', childrenData);
        console.log('ParentChildren: Children IDs:', childrenData.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })));
        setChildren(childrenData);
      } else {
        console.log('ParentChildren: API failed:', resp);
      }
    } catch (e) {
      console.log('ParentChildren: Load error:', e);
      Alert.alert('Error', e?.message || 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('ParentChildren: Component mounted, loading data...');
    load(); 
  }, []);

  // Force refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ParentChildren: Screen focused, refreshing data...');
      load();
    }, [])
  );

  const open = (child) => {
    navigation.navigate('ParentAttendance', { studentId: child.id, childName: child.first_name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Children</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Select a child to view details'}</Text>
      </View>
      <FlatList
        data={children}
        keyExtractor={(item, index) => {
          // Create a unique key combining ID and index to prevent duplicates
          const uniqueKey = `${item.id || 'unknown'}-${index}`;
          console.log('ParentChildren: Child key:', uniqueKey, 'Child:', item);
          return uniqueKey;
        }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => open(item)}>
            <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.meta}>{item.grade_level}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ParentAttendance', { studentId: item.id, childName: item.first_name })}><Text style={styles.btnText}>Attendance</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={() => navigation.navigate('ParentResults', { studentId: item.id, childName: item.first_name })}><Text style={styles.btnText}>Results</Text></TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: isIOS ? 20 : 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  name: { color: '#1a237e', fontWeight: '800' },
  meta: { color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 10 },
  btn: { backgroundColor: '#1a237e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  secondary: { backgroundColor: '#3b82f6' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default ParentChildrenScreen;


