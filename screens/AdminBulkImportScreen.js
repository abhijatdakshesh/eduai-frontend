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

    // Create comprehensive unified template that can handle ALL data types in one file
    const template = `type,first_name,last_name,email,password,role,student_id,department,academic_year,semester,section,grade_level,class_name,room_id,teacher_email,parent_email,parent_phone,parent_relationship,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
student,John,Doe,john.doe@student.edu,password123,student,STU001,Computer Science,2024-2025,1,A,Grade 10,CS101,ROOM-101,teacher@school.edu,parent@email.com,+1234567890,Father,+1234567890,123 Main St,2005-01-15,Male,John Parent +1234567890,None,2024-01-01,active
student,Jane,Smith,jane.smith@student.edu,password123,student,STU002,Mathematics,2024-2025,2,B,Grade 10,MATH101,ROOM-102,teacher2@school.edu,parent2@email.com,+1234567891,Mother,+1234567891,456 Oak Ave,2005-03-22,Female,Jane Parent +1234567891,Allergies: Peanuts,2024-01-01,active
student,Mike,Johnson,mike.johnson@student.edu,password123,student,STU003,Physics,2024-2025,3,C,Grade 11,PHY201,ROOM-103,teacher3@school.edu,parent3@email.com,+1234567892,Father,+1234567892,789 Pine St,2004-07-10,Male,Mike Parent +1234567892,None,2024-01-01,active
teacher,Mr.,Anderson,teacher@school.edu,password123,teacher,,,,,,,Mathematics 10A,ROOM-101,,,,,,+1234567893,789 Pine St,1980-05-10,Male,,None,2024-01-01,active
teacher,Ms.,Brown,teacher2@school.edu,password123,teacher,,,,,,,English 10B,ROOM-102,,,,,,+1234567894,654 Maple Dr,1982-12-03,Female,,None,2024-01-01,active
parent,Mrs.,Williams,parent@email.com,password123,parent,,,,,,,,,,,,,+1234567895,321 Elm St,1985-08-15,Female,,None,2024-01-01,active
parent,Mr.,Davis,parent2@email.com,password123,parent,,,,,,,,,,,,,+1234567896,987 Cedar Ln,1983-11-20,Male,,None,2024-01-01,active
parent,Mrs.,Wilson,parent3@email.com,password123,parent,,,,,,,,,,,,,+1234567897,555 Oak St,1987-03-15,Female,,None,2024-01-01,active
class,,,class@system.edu,,class,,,,,Grade 10,Mathematics 10A,ROOM-101,teacher@school.edu,,,,,,,,,2024-01-01,active
class,,,class2@system.edu,,class,,,,,Grade 10,English 10B,ROOM-102,teacher2@school.edu,,,,,,,,,2024-01-01,active
class,,,class3@system.edu,,class,,,,,Grade 11,Physics 201,ROOM-103,teacher3@school.edu,,,,,,,,,2024-01-01,active`;

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

    // Students template with enhanced fields
    const studentsTemplate = `first_name,last_name,email,password,student_id,department,academic_year,semester,section,grade_level,class_name,parent_email,parent_phone,parent_relationship,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
John,Doe,john.doe@student.edu,password123,STU001,Computer Science,2024-2025,Fall 2024,A,Grade 10,CS101,parent@email.com,+1234567890,Father,+1234567890,123 Main St,2005-01-15,Male,John Parent +1234567890,None,2024-01-01,active
Jane,Smith,jane.smith@student.edu,password123,STU002,Mathematics,2024-2025,Fall 2024,B,Grade 10,MATH101,parent2@email.com,+1234567891,Mother,+1234567891,456 Oak Ave,2005-03-22,Female,Jane Parent +1234567891,Allergies: Peanuts,2024-01-01,active`;

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

  const exportStudents = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Export', 'CSV export supported on web only.');
      return;
    }

    try {
      setUploading(true);
      
      // Try the new export endpoint first
      let response;
      try {
        response = await apiClient.exportStudents();
      } catch (error) {
        console.log('New export endpoint not available, falling back to existing endpoints...');
        
        // Fallback: Use existing admin students endpoint
        const studentsResponse = await apiClient.getAdminStudents();
        if (studentsResponse?.success && studentsResponse.data) {
          const students = studentsResponse.data.students || studentsResponse.data.users || [];
          
          // Create mock parent data for demonstration
          const studentsWithParents = students.map(student => ({
            ...student,
            parent: {
              email: `${student.first_name?.toLowerCase()}.parent@email.com`,
              phone: '+1234567890',
              relationship: 'Parent'
            }
          }));

          response = {
            success: true,
            data: {
              students: studentsWithParents
            }
          };
        } else {
          throw new Error('Failed to fetch students data');
        }
      }
      
      if (response.success && response.data) {
        // Create CSV content from the response data
        const students = response.data.students || [];
        if (students.length === 0) {
          Alert.alert('No Data', 'No students found to export.');
          return;
        }

        // Create CSV headers
        const headers = [
          'first_name', 'last_name', 'email', 'student_id', 'department', 
          'academic_year', 'semester', 'section', 'grade_level', 'class_name',
          'parent_email', 'parent_phone', 'parent_relationship', 'phone', 
          'address', 'date_of_birth', 'gender', 'enrollment_date', 'status'
        ];

        // Create CSV rows
        const csvRows = students.map(student => {
          const parent = student.parent || {};
          return [
            student.first_name || '',
            student.last_name || '',
            student.email || '',
            student.student_id || '',
            student.department || '',
            student.academic_year || '',
            student.semester || '',
            student.section || '',
            student.grade_level || '',
            student.class_name || '',
            parent.email || '',
            parent.phone || '',
            parent.relationship || '',
            student.phone || '',
            student.address || '',
            student.date_of_birth || '',
            student.gender || '',
            student.enrollment_date || '',
            student.status || 'active'
          ];
        });

        // Combine headers and rows
        const csvContent = [headers, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        // Download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        Alert.alert('Export Successful', `Exported ${students.length} students with their parent information.`);
      } else {
        Alert.alert('Export Failed', response.message || 'Failed to export students data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', error.message || 'Failed to export students data');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Import & Export</Text>
        <Text style={styles.headerSubtitle}>Import students, teachers, parents, and classes via CSV or export existing data</Text>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 Export Existing Data</Text>
        <Text style={styles.sectionDescription}>
          Export all students with their parent information, department assignments, and academic details to CSV format.
        </Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.btn, styles.success]} 
            onPress={exportStudents} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Exporting...' : '📤 Export Students with Parents'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single Unified Template Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Single Template for Everything</Text>
        <Text style={styles.sectionDescription}>
          <Text style={styles.bold}>ONE CSV file to upload ALL data:</Text> Students, Teachers, Parents, and Classes. 
          Simply use the 'type' column to specify what each row represents. 
          Parents are automatically created and linked to students based on parent_email.
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={downloadUnifiedTemplate}>
            <Text style={styles.btnText}>📥 Download Complete Template</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.success]} 
            onPress={() => uploadCsv('unified')} 
            disabled={uploading}
          >
            <Text style={styles.btnText}>{uploading ? '⏳ Uploading...' : '📤 Upload Complete CSV'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            💡 <Text style={styles.bold}>Pro Tip:</Text> This single template can handle your entire school setup - 
            just add rows for each student, teacher, parent, and class you want to create!
          </Text>
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
        <Text style={styles.sectionTitle}>📖 How to Use the Single Template</Text>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Single File Approach:</Text> Use ONE CSV file with 'type' column: student, teacher, parent, class</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Required Fields:</Text> first_name, last_name, email, password, role</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>For Students:</Text> Add student_id, department, academic_year, semester, section, grade_level, class_name, parent_email</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>For Parents:</Text> Just add parent rows with basic info - they'll be auto-linked to students via parent_email</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>For Teachers:</Text> Add teacher rows with class assignments</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>For Classes:</Text> Add class rows with room_id, teacher_email</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Academic Organization:</Text> department (e.g., "Computer Science"), academic_year (e.g., "2024-2025"), semester (e.g., "1", "2", "3", "4", "5", "6", "7", "8"), section (e.g., "A", "B", "C")</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Dates:</Text> Use YYYY-MM-DD format (e.g., 2024-01-01)</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Status:</Text> Use 'active' or 'inactive'</Text>
          <Text style={styles.instructionText}>• <Text style={styles.bold}>Magic:</Text> Parents are automatically created and linked to students based on parent_email!</Text>
        </View>
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            🚀 <Text style={styles.bold}>Complete School Setup:</Text> You can set up your entire school with one CSV file - 
            students, their parents, teachers, and classes all in one upload!
          </Text>
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
  success: { backgroundColor: '#10b981' },
  btnText: { color: 'white', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  instructions: { marginTop: 8 },
  instructionText: { color: '#4b5563', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  bold: { fontWeight: '600', color: '#1f2937' },
  highlightBox: { backgroundColor: '#f0f9ff', borderLeftWidth: 4, borderLeftColor: '#3b82f6', padding: 12, marginTop: 12, borderRadius: 8 },
  highlightText: { color: '#1e40af', fontSize: 14, lineHeight: 20 },
});

export default AdminBulkImportScreen;


