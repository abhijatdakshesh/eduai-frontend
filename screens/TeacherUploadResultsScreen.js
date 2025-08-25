import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const TeacherUploadResultsScreen = ({ navigation }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploadMethod, setUploadMethod] = useState(''); // 'csv' or 'manual'
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualResults, setManualResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const classes = [
    { id: '1', name: 'Class 10A', subject: 'Mathematics' },
    { id: '2', name: 'Class 10B', subject: 'Mathematics' },
    { id: '3', name: 'Class 11A', subject: 'Physics' },
    { id: '4', name: 'Class 11B', subject: 'Chemistry' },
  ];

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Computer Science',
  ];

  const students = [
    { id: '1', name: 'John Doe', rollNo: '101' },
    { id: '2', name: 'Jane Smith', rollNo: '102' },
    { id: '3', name: 'Mike Johnson', rollNo: '103' },
    { id: '4', name: 'Sarah Wilson', rollNo: '104' },
  ];

  const handleCSVUpload = () => {
    Alert.alert(
      'Upload CSV',
      'CSV upload functionality will be implemented. For now, you can use manual entry.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Manual Entry', onPress: () => setShowManualModal(true) },
      ]
    );
  };

  const handleManualEntry = () => {
    setManualResults(
      students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        marks: '',
        grade: '',
        remarks: '',
      }))
    );
    setShowManualModal(true);
  };

  const updateManualResult = (studentId, field, value) => {
    setManualResults(prev =>
      prev.map(result =>
        result.studentId === studentId
          ? { ...result, [field]: value }
          : result
      )
    );
  };

  const submitManualResults = async () => {
    const incompleteResults = manualResults.filter(
      result => !result.marks || !result.grade
    );

    if (incompleteResults.length > 0) {
      Alert.alert('Incomplete Data', 'Please fill in all marks and grades.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Results uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowManualModal(false);
              setManualResults([]);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const UploadMethodCard = ({ title, description, icon, onPress, color }) => (
    <TouchableOpacity
      style={[styles.uploadMethodCard, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.uploadMethodIcon}>{icon}</Text>
      <Text style={styles.uploadMethodTitle}>{title}</Text>
      <Text style={styles.uploadMethodDescription}>{description}</Text>
    </TouchableOpacity>
  );

  const ManualEntryModal = () => (
    <Modal
      visible={showManualModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Manual Results Entry</Text>
          <TouchableOpacity
            onPress={() => setShowManualModal(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.classInfo}>
            <Text style={styles.classInfoText}>
              Class: {selectedClass || 'Select Class'} | Subject: {selectedSubject || 'Select Subject'}
            </Text>
          </View>

          {manualResults.map((result, index) => (
            <View key={result.studentId} style={styles.studentResultCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{result.studentName}</Text>
                <Text style={styles.studentRollNo}>Roll No: {result.rollNo}</Text>
              </View>
              
              <View style={styles.resultInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Marks</Text>
                  <TextInput
                    style={styles.input}
                    value={result.marks}
                    onChangeText={(value) => updateManualResult(result.studentId, 'marks', value)}
                    placeholder="Enter marks"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Grade</Text>
                  <TextInput
                    style={styles.input}
                    value={result.grade}
                    onChangeText={(value) => updateManualResult(result.studentId, 'grade', value)}
                    placeholder="A/B/C/D/F"
                    autoCapitalize="characters"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Remarks</Text>
                  <TextInput
                    style={styles.input}
                    value={result.remarks}
                    onChangeText={(value) => updateManualResult(result.studentId, 'remarks', value)}
                    placeholder="Optional remarks"
                    multiline
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowManualModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={submitManualResults}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Uploading...' : 'Upload Results'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Results</Text>
        <Text style={styles.headerSubtitle}>Upload student results via CSV or manual entry</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Class and Subject Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Select Class & Subject</Text>
          
          <View style={styles.selectionRow}>
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>Class</Text>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => {
                  // Show class picker
                  Alert.alert('Select Class', 'Class selection will be implemented');
                }}
              >
                <Text style={styles.selectionButtonText}>
                  {selectedClass || 'Choose Class'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>Subject</Text>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => {
                  // Show subject picker
                  Alert.alert('Select Subject', 'Subject selection will be implemented');
                }}
              >
                <Text style={styles.selectionButtonText}>
                  {selectedSubject || 'Choose Subject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upload Methods */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Choose Upload Method</Text>
          
          <View style={styles.uploadMethods}>
            <UploadMethodCard
              title="Upload CSV File"
              description="Upload a CSV file with student results"
              icon="📄"
              color="#3f51b5"
              onPress={handleCSVUpload}
            />
            
            <UploadMethodCard
              title="Manual Entry"
              description="Enter results manually for each student"
              icon="✏️"
              color="#ff9800"
              onPress={handleManualEntry}
            />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>CSV Format:</Text>
            <Text style={styles.instructionText}>
              • Student ID, Name, Roll No, Marks, Grade, Remarks{'\n'}
              • First row should contain headers{'\n'}
              • Save file as .csv format
            </Text>
          </View>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>Manual Entry:</Text>
            <Text style={styles.instructionText}>
              • Select class and subject first{'\n'}
              • Enter marks, grade, and optional remarks{'\n'}
              • All fields are required except remarks
            </Text>
          </View>
        </View>
      </ScrollView>

      <ManualEntryModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  selectionButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  uploadSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadMethodCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  uploadMethodIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  uploadMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadMethodDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  instructionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  classInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  classInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  studentResultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  studentRollNo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  resultInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TeacherUploadResultsScreen;
