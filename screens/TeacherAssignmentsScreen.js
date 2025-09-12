import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const TeacherAssignmentsScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: '',
    assignmentType: 'Homework',
    classId: ''
  });
  const [attachedFiles, setAttachedFiles] = useState([]);

  useBackButton(navigation);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('TeacherAssignments: Fetching assignments...');
      
      const response = await apiClient.getTeacherAssignments();
      console.log('TeacherAssignments: Assignments response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response?.data?.assignments) {
        setAssignments(response.data.assignments);
      } else {
        console.log('TeacherAssignments: No assignments found or API error');
        setAssignments([]);
      }
    } catch (error) {
      console.log('TeacherAssignments: Error fetching assignments:', error.message);
      Alert.alert('Error', 'Failed to load assignments. Please try again.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      console.log('TeacherAssignments: Starting document picker...');
      console.log('TeacherAssignments: Platform:', Platform.OS);
      
      // Web platform fallback
      if (Platform.OS === 'web') {
        console.log('TeacherAssignments: Using web file input fallback');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.zip';
        input.multiple = false;
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            console.log('TeacherAssignments: Web file selected:', file);
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
              Alert.alert('Error', 'File size must be less than 10MB');
              return;
            }
            
            const newFile = {
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              size: file.size,
            };
            
            console.log('TeacherAssignments: Adding web file to attachments:', newFile);
            setAttachedFiles(prev => [...prev, newFile]);
            Alert.alert('Success', `File "${file.name}" added successfully!`);
          }
        };
        
        input.click();
        return;
      }
      
      // Check if DocumentPicker is available
      if (!DocumentPicker.getDocumentAsync) {
        Alert.alert('Error', 'Document picker is not available on this platform');
        return;
      }
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('TeacherAssignments: Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('TeacherAssignments: Selected file:', file);
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          Alert.alert('Error', 'File size must be less than 10MB');
          return;
        }
        
        const newFile = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size,
        };
        
        console.log('TeacherAssignments: Adding file to attachments:', newFile);
        setAttachedFiles(prev => [...prev, newFile]);
        Alert.alert('Success', `File "${file.name}" added successfully!`);
      } else {
        console.log('TeacherAssignments: Document picker was canceled');
      }
    } catch (error) {
      console.log('TeacherAssignments: Error picking document:', error);
      console.log('TeacherAssignments: Error stack:', error.stack);
      Alert.alert('Error', `Failed to pick document: ${error.message}`);
    }
  };

  const pickImage = async () => {
    try {
      console.log('TeacherAssignments: Starting image picker...');
      console.log('TeacherAssignments: Platform:', Platform.OS);
      
      // Web platform fallback
      if (Platform.OS === 'web') {
        console.log('TeacherAssignments: Using web image input fallback');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            console.log('TeacherAssignments: Web image selected:', file);
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
              Alert.alert('Error', 'Image size must be less than 10MB');
              return;
            }
            
            const newFile = {
              uri: URL.createObjectURL(file),
              name: file.name || `image_${Date.now()}.jpg`,
              type: file.type || 'image/jpeg',
              size: file.size,
            };
            
            console.log('TeacherAssignments: Adding web image to attachments:', newFile);
            setAttachedFiles(prev => [...prev, newFile]);
            Alert.alert('Success', `Image "${newFile.name}" added successfully!`);
          }
        };
        
        input.click();
        return;
      }
      
      // Check if ImagePicker is available
      if (!ImagePicker.launchImageLibraryAsync) {
        Alert.alert('Error', 'Image picker is not available on this platform');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('TeacherAssignments: Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('TeacherAssignments: Selected image:', image);
        
        if (image.fileSize > 10 * 1024 * 1024) { // 10MB limit
          Alert.alert('Error', 'Image size must be less than 10MB');
          return;
        }
        
        const newFile = {
          uri: image.uri,
          name: image.fileName || `image_${Date.now()}.jpg`,
          type: image.mimeType || 'image/jpeg',
          size: image.fileSize,
        };
        
        console.log('TeacherAssignments: Adding image to attachments:', newFile);
        setAttachedFiles(prev => [...prev, newFile]);
        Alert.alert('Success', `Image "${newFile.name}" added successfully!`);
      } else {
        console.log('TeacherAssignments: Image picker was canceled');
      }
    } catch (error) {
      console.log('TeacherAssignments: Error picking image:', error);
      console.log('TeacherAssignments: Error stack:', error.stack);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const showFilePicker = () => {
    console.log('TeacherAssignments: showFilePicker called');
    console.log('TeacherAssignments: Platform:', Platform.OS);
    
    // Web platform - use direct file input instead of Alert
    if (Platform.OS === 'web') {
      console.log('TeacherAssignments: Using web direct file picker');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.zip,image/*';
      input.multiple = false;
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log('TeacherAssignments: Web file selected:', file);
          
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB');
            return;
          }
          
          const newFile = {
            uri: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            size: file.size,
          };
          
          console.log('TeacherAssignments: Adding web file to attachments:', newFile);
          setAttachedFiles(prev => [...prev, newFile]);
          alert(`File "${file.name}" added successfully!`);
        }
      };
      
      input.click();
      return;
    }
    
    try {
      Alert.alert(
        'Add File',
        'Choose the type of file you want to upload',
        [
          { text: 'Document', onPress: () => {
            console.log('TeacherAssignments: Document option selected');
            pickDocument();
          }},
          { text: 'Image', onPress: () => {
            console.log('TeacherAssignments: Image option selected');
            pickImage();
          }},
          { text: 'Cancel', style: 'cancel', onPress: () => {
            console.log('TeacherAssignments: File picker canceled');
          }}
        ]
      );
    } catch (error) {
      console.log('TeacherAssignments: Error in showFilePicker:', error);
      Alert.alert('Error', `Failed to show file picker: ${error.message}`);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate || !newAssignment.maxPoints) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log('TeacherAssignments: Creating assignment...');
      
      // Convert files to the format expected by the API
      const files = attachedFiles.map(file => ({
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      
      console.log('TeacherAssignments: Creating assignment with data:', {
        assignment: newAssignment,
        files: files
      });
      
      const response = await apiClient.createTeacherAssignment(newAssignment, files);
      console.log('TeacherAssignments: Create assignment response:', response);
      
      if (response?.success) {
        Alert.alert('Success', 'Assignment created successfully!');
        setShowCreateModal(false);
        setNewAssignment({
          title: '',
          description: '',
          instructions: '',
          dueDate: '',
          maxPoints: '',
          assignmentType: 'Homework',
          classId: ''
        });
        setAttachedFiles([]); // Clear attached files
        fetchAssignments(); // Refresh the list
      } else {
        Alert.alert('Error', response?.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.log('TeacherAssignments: Error creating assignment:', error.message);
      Alert.alert('Error', 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (dueDate, submissions) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) {
      return '#ef4444'; // Red for overdue
    } else if (submissions && submissions.length > 0) {
      return '#10b981'; // Green for submitted
    } else {
      return '#f59e0b'; // Yellow for pending
    }
  };

  const getStatusText = (dueDate, submissions) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) {
      return 'Overdue';
    } else if (submissions && submissions.length > 0) {
      return `${submissions.length} Submitted`;
    } else {
      return 'Pending';
    }
  };

  const renderAssignmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() => navigation.navigate('TeacherAssignmentDetail', { assignmentId: item.id })}
    >
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.due_date, item.submissions) }]}>
          <Text style={styles.statusText}>{getStatusText(item.due_date, item.submissions)}</Text>
        </View>
      </View>
      
      <Text style={styles.assignmentDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.assignmentMeta}>
        <Text style={styles.metaText}>Due: {formatDate(item.due_date)}</Text>
        <Text style={styles.metaText}>Points: {item.max_points}</Text>
        <Text style={styles.metaText}>Type: {item.assignment_type}</Text>
      </View>
      
      {item.submissions && item.submissions.length > 0 && (
        <View style={styles.submissionsInfo}>
          <Text style={styles.submissionsText}>
            {item.submissions.length} submission{item.submissions.length !== 1 ? 's' : ''} received
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && assignments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Assignments</Text>
          <Text style={styles.headerSubtitle}>Manage and track student submissions</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create Assignment</Text>
        </TouchableOpacity>
      </View>

      {/* Assignments List */}
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={renderAssignmentItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchAssignments}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No assignments yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first assignment to get started
            </Text>
          </View>
        }
      />

      {/* Create Assignment Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Assignment</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assignment Title *</Text>
              <TextInput
                style={styles.input}
                value={newAssignment.title}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, title: text })}
                placeholder="Enter assignment title"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newAssignment.description}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, description: text })}
                placeholder="Enter assignment description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newAssignment.instructions}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, instructions: text })}
                placeholder="Enter detailed instructions"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date *</Text>
              <TextInput
                style={styles.input}
                value={newAssignment.dueDate}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, dueDate: text })}
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Points *</Text>
              <TextInput
                style={styles.input}
                value={newAssignment.maxPoints}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, maxPoints: text })}
                placeholder="Enter maximum points"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assignment Type</Text>
              <View style={styles.typeButtons}>
                {['Homework', 'Project', 'Quiz', 'Exam'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newAssignment.assignmentType === type && styles.typeButtonActive
                    ]}
                    onPress={() => setNewAssignment({ ...newAssignment, assignmentType: type })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newAssignment.assignmentType === type && styles.typeButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* File Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Attachments (Optional)</Text>
              
              {attachedFiles.length > 0 && (
                <View style={styles.attachedFilesContainer}>
                  {attachedFiles.map((file, index) => (
                    <View key={index} style={styles.attachedFileItem}>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeFileButton}
                        onPress={() => removeFile(index)}
                      >
                        <Text style={styles.removeFileButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.filePickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.addFileButton,
                    attachedFiles.length >= 5 && styles.addFileButtonDisabled
                  ]}
                  onPress={showFilePicker}
                  disabled={attachedFiles.length >= 5}
                >
                  <Text style={styles.addFileButtonText}>
                    {attachedFiles.length >= 5 ? 'Max 5 files' : '+ Add File'}
                  </Text>
                </TouchableOpacity>
                
                {/* Debug button for testing */}
                <TouchableOpacity
                  style={[styles.addFileButton, { backgroundColor: '#f59e0b', marginLeft: 8 }]}
                  onPress={() => {
                    console.log('Current attached files:', attachedFiles);
                    Alert.alert('Debug', `Attached files: ${attachedFiles.length}\nFiles: ${JSON.stringify(attachedFiles.map(f => f.name), null, 2)}`);
                  }}
                >
                  <Text style={styles.addFileButtonText}>Debug</Text>
                </TouchableOpacity>
                
                {/* Test button to verify button functionality */}
                <TouchableOpacity
                  style={[styles.addFileButton, { backgroundColor: '#10b981', marginLeft: 8 }]}
                  onPress={() => {
                    console.log('Test button clicked - button functionality works');
                    Alert.alert('Test', 'Button click is working! This means the issue is with the file picker functions.');
                  }}
                >
                  <Text style={styles.addFileButtonText}>Test</Text>
                </TouchableOpacity>
                
                {/* Direct file input for web testing */}
                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    style={[styles.addFileButton, { backgroundColor: '#8b5cf6', marginLeft: 8 }]}
                    onPress={() => {
                      console.log('Direct file input test');
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '*/*';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          console.log('Direct file selected:', file);
                          alert(`File selected: ${file.name}`);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Text style={styles.addFileButtonText}>Direct</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.fileUploadHint}>
                Supported: PDF, DOC, DOCX, TXT, ZIP, Images (Max 10MB each, 5 files max)
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleCreateAssignment}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Assignment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#1a237e',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14,
  },
  createButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  submissionsInfo: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  submissionsText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#1a237e',
  },
  modalTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: '#e3f2fd',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  typeButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  attachedFilesContainer: {
    marginBottom: 12,
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSize: {
    color: '#6b7280',
    fontSize: 12,
  },
  removeFileButton: {
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeFileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFileButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  addFileButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addFileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fileUploadHint: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default TeacherAssignmentsScreen;
