import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const TeacherAssignmentDetailScreen = ({ navigation, route }) => {
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');

  useBackButton(navigation);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      console.log('TeacherAssignmentDetail: Fetching assignment details...');
      
      const response = await apiClient.getTeacherAssignment(assignmentId);
      console.log('TeacherAssignmentDetail: Assignment details response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response?.data?.assignment) {
        // Merge assignment data with submissions data
        const assignmentData = {
          ...response.data.assignment,
          submissions: response.data.submissions || []
        };
        setAssignment(assignmentData);
      } else {
        console.log('TeacherAssignmentDetail: Assignment not found or API error');
        Alert.alert('Error', 'Assignment not found');
        navigation.goBack();
      }
    } catch (error) {
      console.log('TeacherAssignmentDetail: Error fetching assignment details:', error.message);
      Alert.alert('Error', 'Failed to load assignment details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!grade || isNaN(grade) || parseFloat(grade) < 0) {
      Alert.alert('Error', 'Please enter a valid grade');
      return;
    }

    try {
      setLoading(true);
      console.log('TeacherAssignmentDetail: Grading submission...');
      
      const response = await apiClient.gradeAssignmentSubmission(
        selectedSubmission.id,
        parseFloat(grade),
        feedback
      );
      console.log('TeacherAssignmentDetail: Grade submission response:', response);
      
      if (response?.success) {
        Alert.alert('Success', 'Submission graded successfully!');
        setShowGradeModal(false);
        setGrade('');
        setFeedback('');
        setSelectedSubmission(null);
        fetchAssignmentDetails(); // Refresh the assignment details
      } else {
        Alert.alert('Error', response?.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.log('TeacherAssignmentDetail: Error grading submission:', error.message);
      Alert.alert('Error', 'Failed to grade submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade ? submission.grade.toString() : '');
    setFeedback(submission.feedback || '');
    setShowGradeModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const downloadFile = async (submissionId, attachment) => {
    try {
      console.log('TeacherAssignmentDetail: Downloading file...');
      console.log('TeacherAssignmentDetail: Platform.OS:', Platform.OS);
      console.log('TeacherAssignmentDetail: Attachment object:', attachment);
      
      // Use the direct URL from the attachment object
      const fileUrl = attachment.url;
      console.log('TeacherAssignmentDetail: File URL:', fileUrl);
      
      if (fileUrl) {
        const fileName = attachment.filename || attachment.originalName || 'attachment';
        
        // For web platform, use browser download
        if (Platform.OS === 'web') {
          console.log('TeacherAssignmentDetail: Creating download link for web platform');
          console.log('TeacherAssignmentDetail: File name:', fileName);
          // Fetch file with authentication header and trigger download
          const token = await apiClient.getToken();
          console.log('TeacherAssignmentDetail: Retrieved token for download:', token ? token.substring(0, 20) + '...' : 'null');
          
          try {
            const response = await fetch(fileUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              console.log('TeacherAssignmentDetail: Created blob URL for download:', blobUrl);
              
              // Create a temporary link and trigger download
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = fileName;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Clean up the blob URL after a delay
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
              
              Alert.alert('Success', `File "${fileName}" download started!`);
            } else {
              console.log('TeacherAssignmentDetail: Download fetch failed:', response.status, response.statusText);
              Alert.alert('Error', `Failed to download file: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.log('TeacherAssignmentDetail: Download fetch error:', error);
            Alert.alert('Error', 'Failed to download file. Please try again.');
          }
        } else {
          // For mobile platforms, use FileSystem
          const downloadResult = await FileSystem.downloadAsync(
            fileUrl,
            FileSystem.documentDirectory + fileName
          );
          
          if (downloadResult.status === 200) {
            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
              // Share the file
              await Sharing.shareAsync(downloadResult.uri, {
                mimeType: attachment.mime_type || 'application/octet-stream',
                dialogTitle: `Download ${fileName}`,
              });
            } else {
              // Fallback: open with system default app
              await Linking.openURL(downloadResult.uri);
            }
            
            Alert.alert('Success', `File "${fileName}" downloaded successfully!`);
          } else {
            throw new Error('Download failed');
          }
        }
      } else {
        throw new Error('Could not get file URL');
      }
    } catch (error) {
      console.log('TeacherAssignmentDetail: Error downloading file:', error.message);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const viewFile = async (submissionId, attachment) => {
    try {
      console.log('TeacherAssignmentDetail: Viewing file...');
      console.log('TeacherAssignmentDetail: Platform.OS:', Platform.OS);
      console.log('TeacherAssignmentDetail: Attachment object:', attachment);
      
      // Use the direct URL from the attachment object
      const fileUrl = attachment.url;
      console.log('TeacherAssignmentDetail: File URL:', fileUrl);
      
      if (fileUrl) {
        
        // Check if it's an image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const isImage = imageExtensions.some(ext => 
          attachment.filename.toLowerCase().endsWith(ext)
        );
        
        // For web platform, open in new tab
        if (Platform.OS === 'web') {
          console.log('TeacherAssignmentDetail: Opening file in new tab for web platform');
          // Fetch file with authentication header and create blob URL
          const token = await apiClient.getToken();
          console.log('TeacherAssignmentDetail: Retrieved token:', token ? token.substring(0, 20) + '...' : 'null');
          
          try {
            const response = await fetch(fileUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              console.log('TeacherAssignmentDetail: File loaded successfully, size:', blob.size);
              
              // Check if it's a text file that can be previewed
              const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.log', '.js', '.html', '.css'];
              const isTextFile = textExtensions.some(ext => 
                attachment.filename.toLowerCase().endsWith(ext)
              );
              
              if (isTextFile) {
                // For text files, show preview in modal
                const text = await blob.text();
                setPreviewContent(text);
                setPreviewFileName(attachment.filename);
                setPreviewFileType('text');
                setPreviewModalVisible(true);
              } else {
                // Check if it's an image or PDF for richer preview
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                const isImage = imageExtensions.some(ext => 
                  attachment.filename.toLowerCase().endsWith(ext)
                );
                const isPdf = attachment.filename.toLowerCase().endsWith('.pdf') || (attachment.mimetype || '').includes('pdf');

                const blobUrl = URL.createObjectURL(blob);
                setPreviewBlobUrl(blobUrl);
                setPreviewFileName(attachment.filename);

                if (isImage) {
                  setPreviewFileType('image');
                  setPreviewModalVisible(true);
                } else if (isPdf) {
                  setPreviewFileType('pdf');
                  // For PDFs, open in a new tab to leverage browser viewer
                  window.open(blobUrl, '_blank');
                  // Keep modal hidden for PDFs; user can return to app
                } else {
                  // Fallback info
                  setPreviewFileType('binary');
                  setPreviewContent(`File: ${attachment.filename}\nSize: ${(blob.size / 1024).toFixed(2)} KB\nType: ${attachment.mimetype || 'Unknown'}\n\nThis file type cannot be previewed. Please use the Download button to save it.`);
                  setPreviewModalVisible(true);
                }
              }
            } else {
              console.log('TeacherAssignmentDetail: Fetch failed:', response.status, response.statusText);
              Alert.alert('Error', `Failed to load file: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.log('TeacherAssignmentDetail: Fetch error:', error);
            Alert.alert('Error', 'Failed to load file. Please try downloading it instead.');
          }
        } else {
          if (isImage) {
            // For images, we can show them in a modal or open in browser
            Alert.alert(
              'View Image',
              'Would you like to view this image?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'View', onPress: () => Linking.openURL(fileUrl) }
              ]
            );
          } else {
            // For other files, try to open with system default app
            const canOpen = await Linking.canOpenURL(fileUrl);
            if (canOpen) {
              await Linking.openURL(fileUrl);
            } else {
              // Fallback to download
              downloadFile(submissionId, attachment);
            }
          }
        }
      } else {
        throw new Error('Could not get file URL');
      }
    } catch (error) {
      console.log('TeacherAssignmentDetail: Error viewing file:', error.message);
      Alert.alert('Error', 'Failed to view file. Please try downloading it instead.');
    }
  };

  const renderSubmissionItem = ({ item }) => (
      <View style={styles.submissionCard}>
        <View style={styles.submissionHeader}>
          <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.studentId}>{item.student_id}</Text>
        </View>
      
      <Text style={styles.submissionDate}>
        Submitted: {formatDate(item.submitted_at)}
      </Text>
      
      {item.submission_text && (
        <Text style={styles.submissionText} numberOfLines={3}>
          {item.submission_text}
        </Text>
      )}
      
      {item.attachments && item.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          {item.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentText}>
                  📎 {attachment.filename}
                </Text>
                {attachment.file_size && (
                  <Text style={styles.attachmentSize}>
                    ({(attachment.file_size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                )}
              </View>
              <View style={styles.attachmentActions}>
                <TouchableOpacity
                  style={styles.viewFileButton}
                  onPress={() => {
                    console.log('TeacherAssignmentDetail: View button pressed');
                    console.log('TeacherAssignmentDetail: Submission ID:', item.id);
                    console.log('TeacherAssignmentDetail: Attachment:', attachment);
                    viewFile(item.id, attachment);
                  }}
                >
                  <Text style={styles.viewFileButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.downloadFileButton}
                  onPress={() => {
                    console.log('TeacherAssignmentDetail: Download button pressed');
                    console.log('TeacherAssignmentDetail: Submission ID:', item.id);
                    console.log('TeacherAssignmentDetail: Attachment:', attachment);
                    downloadFile(item.id, attachment);
                  }}
                >
                  <Text style={styles.downloadFileButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      {(!item.attachments || item.attachments.length === 0) && (
        <Text style={styles.noSubmissionsSubtext}>No files attached</Text>
      )}
      
      <View style={styles.submissionFooter}>
        {item.grade !== null && item.grade !== undefined ? (
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeText}>
              Grade: {item.grade}/{assignment?.max_points}
            </Text>
            <TouchableOpacity
              style={styles.editGradeButton}
              onPress={() => openGradeModal(item)}
            >
              <Text style={styles.editGradeButtonText}>Edit Grade</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.gradeButton}
            onPress={() => openGradeModal(item)}
          >
            <Text style={styles.gradeButtonText}>Grade Submission</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {item.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Feedback:</Text>
          <Text style={styles.feedbackText}>{item.feedback}</Text>
        </View>
      )}
    </View>
  );

  if (loading && !assignment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading assignment details...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Assignment not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>{assignment.title}</Text>
          <Text style={styles.headerSubtitle}>
            {assignment.assignment_type} • {assignment.max_points} points
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Assignment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{assignment.description}</Text>
          </View>
          
          {assignment.instructions && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Instructions:</Text>
              <Text style={styles.detailValue}>{assignment.instructions}</Text>
            </View>
          )}

          {/* Assignment Attachments */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.detailLabel}>Assignment Files:</Text>
            {assignment.attachments && assignment.attachments.length > 0 ? (
              <View style={styles.attachmentsContainer}>
                {assignment.attachments.map((attachment, index) => (
                  <View key={`assign-attach-${index}`} style={styles.attachmentItem}>
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentText}>
                        📄 {attachment.filename || attachment.originalName || 'file'}
                      </Text>
                      {attachment.size && (
                        <Text style={styles.attachmentSize}>
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                      )}
                    </View>
                    <View style={styles.attachmentActions}>
                      <TouchableOpacity
                        style={styles.viewFileButton}
                        onPress={() => {
                          console.log('TeacherAssignmentDetail: View assignment file');
                          console.log('TeacherAssignmentDetail: Attachment:', attachment);
                          viewFile(null, attachment);
                        }}
                      >
                        <Text style={styles.viewFileButtonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadFileButton}
                        onPress={() => {
                          console.log('TeacherAssignmentDetail: Download assignment file');
                          console.log('TeacherAssignmentDetail: Attachment:', attachment);
                          downloadFile(null, attachment);
                        }}
                      >
                        <Text style={styles.downloadFileButtonText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noSubmissionsSubtext}>No files attached</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{formatDate(assignment.due_date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Max Points:</Text>
            <Text style={styles.detailValue}>{assignment.max_points}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{assignment.assignment_type}</Text>
          </View>
        </View>

        {/* Submissions */}
        <View style={styles.submissionsCard}>
          <View style={styles.submissionsHeader}>
            <Text style={styles.sectionTitle}>
              Submissions ({assignment.submissions?.length || 0})
            </Text>
          </View>
          
          {assignment.submissions && assignment.submissions.length > 0 ? (
            <FlatList
              data={assignment.submissions}
              keyExtractor={(item) => item.id}
              renderItem={renderSubmissionItem}
              scrollEnabled={false}
              contentContainerStyle={styles.submissionsList}
            />
          ) : (
            <View style={styles.noSubmissionsContainer}>
              <Text style={styles.noSubmissionsText}>No submissions yet</Text>
              <Text style={styles.noSubmissionsSubtext}>
                Students will appear here once they submit their assignments
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Grade Modal */}
      <Modal
        visible={showGradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Grade Submission</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGradeModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedSubmission && (
              <View style={styles.studentInfo}>
                <Text style={styles.studentInfoText}>
                  Student: {selectedSubmission.first_name} {selectedSubmission.last_name}
                </Text>
                <Text style={styles.studentInfoText}>
                  ID: {selectedSubmission.student_id}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grade (out of {assignment?.max_points}) *</Text>
              <TextInput
                style={styles.input}
                value={grade}
                onChangeText={setGrade}
                placeholder="Enter grade"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Feedback</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Enter feedback for the student"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleGradeSubmission}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Grading...' : 'Submit Grade'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* File Preview Modal */}
      <Modal
        visible={previewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setPreviewModalVisible(false);
          if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl('');
          }
        }}
      >
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalHeader}>
            <Text style={styles.previewModalTitle}>File Preview</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setPreviewModalVisible(false);
                if (previewBlobUrl) {
                  URL.revokeObjectURL(previewBlobUrl);
                  setPreviewBlobUrl('');
                }
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewModalContent}>
            <Text style={styles.previewFileName}>{previewFileName}</Text>
            {previewFileType === 'image' && previewBlobUrl ? (
              <ScrollView contentContainerStyle={{alignItems:'center'}}>
                <Image source={{ uri: previewBlobUrl }} style={{ width: '100%', height: 400, resizeMode: 'contain', backgroundColor:'#00000010' }} />
              </ScrollView>
            ) : (
              <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={true}>
                <Text style={[
                  styles.previewContent,
                  previewFileType === 'text' ? styles.previewTextContent : styles.previewInfoContent
                ]}>
                  {previewContent}
                </Text>
              </ScrollView>
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
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
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isIOS ? 24 : 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14,
  },
  scrollContainer: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  submissionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  submissionsHeader: {
    marginBottom: 16,
  },
  submissionsList: {
    paddingBottom: 16,
  },
  submissionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 16,
  },
  studentId: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  submissionDate: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 8,
  },
  submissionText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  attachmentsContainer: {
    marginBottom: 8,
  },
  attachmentsLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentSize: {
    color: '#6b7280',
    fontSize: 11,
  },
  attachmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewFileButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  viewFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadFileButton: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  downloadFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  submissionFooter: {
    marginTop: 8,
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  editGradeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editGradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  gradeButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  gradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  feedbackLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#374151',
    fontSize: 12,
    fontStyle: 'italic',
  },
  noSubmissionsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSubmissionsText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noSubmissionsSubtext: {
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
  studentInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  studentInfoText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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
  // Preview Modal Styles
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  previewModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  previewModalContent: {
    flex: 1,
    padding: 20,
  },
  previewFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  previewScrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
  },
  previewContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewTextContent: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1f2937',
    whiteSpace: 'pre-wrap',
  },
  previewInfoContent: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TeacherAssignmentDetailScreen;
