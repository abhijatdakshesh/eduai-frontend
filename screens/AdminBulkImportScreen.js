import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { apiClient } from '../services/api';

const AdminBulkImportScreen = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('unified');

  const downloadUnifiedTemplate = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Template', 'Download available on web.');
      return;
    }

    // Create comprehensive template with all possible fields
    const template = `type,first_name,last_name,email,password,role,grade_level,class_name,room_id,teacher_email,parent_email,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
student,John,Doe,john.doe@student.edu,password123,student,Grade 10,Mathematics 10A,ROOM-101,teacher@school.edu,parent@email.com,+1234567890,123 Main St,2005-01-15,Male,John Parent +1234567890,None,2024-01-01,active
student,Jane,Smith,jane.smith@student.edu,password123,student,Grade 10,Mathematics 10A,ROOM-101,teacher@school.edu,parent2@email.com,+1234567891,456 Oak Ave,2005-03-22,Female,Jane Parent +1234567891,Allergies: Peanuts,2024-01-01,active
teacher,Mr.,Johnson,teacher@school.edu,password123,teacher,,Mathematics 10A,ROOM-101,,,,+1234567892,789 Pine St,1980-05-10,Male,,None,2024-01-01,active
parent,Mrs.,Williams,parent@email.com,password123,parent,,,,,,+1234567893,321 Elm St,1985-08-15,Female,,None,2024-01-01,active
class,,,class@system.edu,,class,Grade 10,Mathematics 10A,ROOM-101,teacher@school.edu,,,,,,,,,2024-01-01,active`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unified_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSeparateTemplates = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Template', 'Download available on web.');
      return;
    }

    // Students template
    const studentsTemplate = `first_name,last_name,email,password,grade_level,class_name,parent_email,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
John,Doe,john.doe@student.edu,password123,Grade 10,Mathematics 10A,parent@email.com,+1234567890,123 Main St,2005-01-15,Male,John Parent +1234567890,None,2024-01-01,active
Jane,Smith,jane.smith@student.edu,password123,Grade 10,Mathematics 10A,parent2@email.com,+1234567891,456 Oak Ave,2005-03-22,Female,Jane Parent +1234567891,Allergies: Peanuts,2024-01-01,active`;

    // Teachers template
    const teachersTemplate = `first_name,last_name,email,password,phone,address,date_of_birth,gender,emergency_contact,medical_info,employment_date,status
Mr.,Johnson,teacher@school.edu,password123,+1234567892,789 Pine St,1980-05-10,Male,,None,2024-01-01,active
Ms.,Brown,teacher2@school.edu,password123,+1234567894,654 Maple Dr,1982-12-03,Female,,None,2024-01-01,active`;

    // Parents template
    const parentsTemplate = `first_name,last_name,email,password,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
Mrs.,Williams,parent@email.com,password123,+1234567893,321 Elm St,1985-08-15,Female,,None,2024-01-01,active
Mr.,Davis,parent2@email.com,password123,+1234567895,987 Cedar Ln,1983-11-20,Male,,None,2024-01-01,active`;

    // Classes template
    const classesTemplate = `name,grade_level,room_id,teacher_email,capacity,description,schedule,status
Mathematics 10A,Grade 10,ROOM-101,teacher@school.edu,30,Advanced Mathematics for Grade 10,Mon-Fri 9:00-10:00,active
English 10B,Grade 10,ROOM-102,teacher2@school.edu,25,English Literature and Composition,Mon-Fri 10:00-11:00,active`;

    // Download all templates
    const templates = [
      { name: 'students_template.csv', content: studentsTemplate },
      { name: 'teachers_template.csv', content: teachersTemplate },
      { name: 'parents_template.csv', content: parentsTemplate },
      { name: 'classes_template.csv', content: classesTemplate }
    ];

    templates.forEach(template => {
      const blob = new Blob([template.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const uploadCsv = async (type) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Upload', 'CSV upload supported on web only.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        console.log('Uploading file:', file.name, 'Type:', type);
        
        // Call the appropriate API endpoint
        let response;
        if (type === 'unified') {
          response = await apiClient.bulkImportUnified(formData);
        } else {
          response = await apiClient.bulkImport(type, formData);
        }

        if (response.success) {
          Alert.alert(
            'Import Successful', 
            `Successfully imported ${response.data?.imported || 0} records. ${response.data?.errors || 0} errors.`
          );
        } else {
          Alert.alert('Import Failed', response.message || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Bulk import error:', error);
        Alert.alert('Import Error', error.message || 'Failed to import CSV file');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Import</Text>
        <Text style={styles.headerSubtitle}>Import students, teachers, parents, and classes via CSV</Text>
      </View>

      {/* Unified Template Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Unified Template (Recommended)</Text>
        <Text style={styles.sectionDescription}>
          Import all types (students, teachers, parents, classes) in a single CSV file. 
          Use the 'type' column to specify what each row represents.
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={downloadUnifiedTemplate}>
            <Text style={styles.btnText}>📥 Download Unified Template</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.primary]} 
            onPress={() => uploadCsv('unified')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Unified CSV'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Separate Templates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Separate Templates</Text>
        <Text style={styles.sectionDescription}>
          Download individual templates for each type. Upload them separately.
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={downloadSeparateTemplates}>
            <Text style={styles.btnText}>📥 Download All Templates</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Students</Text>
          <TouchableOpacity 
            style={[styles.btn, styles.secondary]} 
            onPress={() => uploadCsv('students')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Students'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Teachers</Text>
          <TouchableOpacity 
            style={[styles.btn, styles.secondary]} 
            onPress={() => uploadCsv('teachers')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Teachers'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Parents</Text>
          <TouchableOpacity 
            style={[styles.btn, styles.secondary]} 
            onPress={() => uploadCsv('parents')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Parents'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Classes</Text>
          <TouchableOpacity 
            style={[styles.btn, styles.secondary]} 
            onPress={() => uploadCsv('classes')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Classes'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Instructions</Text>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Unified Template:</Text> Use 'type' column with values: student, teacher, parent, class</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Required Fields:</Text> first_name, last_name, email, password, role</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Students:</Text> Include grade_level, class_name, parent_email</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Classes:</Text> Include name, grade_level, room_id, teacher_email</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Dates:</Text> Use YYYY-MM-DD format (e.g., 2024-01-01)</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Status:</Text> Use 'active' or 'inactive'</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 24 },
  headerSubtitle: { color: '#e3f2fd', fontSize: 14, marginTop: 4 },
  section: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { color: '#1a237e', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  sectionDescription: { color: '#6b7280', fontSize: 14, marginBottom: 16, lineHeight: 20 },
  subSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  subSectionTitle: { color: '#374151', fontWeight: '600', fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { backgroundColor: '#6b7280', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, minWidth: 120 },
  primary: { backgroundColor: '#1a237e' },
  secondary: { backgroundColor: '#3b82f6' },
  btnText: { color: 'white', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  instructions: { marginTop: 8 },
  instructionText: { color: '#4b5563', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  bold: { fontWeight: '600', color: '#1f2937' },
});

export default AdminBulkImportScreen;


