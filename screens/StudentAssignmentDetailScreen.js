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
  TextInput,
  Image,
  Linking,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const StudentAssignmentDetailScreen = ({ navigation, route }) => {
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showFilePickerModal, setShowFilePickerModal] = useState(false);
  const [alreadySubmittedNotice, setAlreadySubmittedNotice] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replaceAttachments, setReplaceAttachments] = useState(false);
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
      console.log('StudentAssignmentDetail: Fetching assignment details...');
      
      const response = await apiClient.getStudentAssignment(assignmentId);
      console.log('StudentAssignmentDetail: Assignment details response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response?.data?.assignment) {
        setAssignment(response.data.assignment);
        setIsEditing(false);
        setReplaceAttachments(false);
        // Pre-fill submission text if already submitted
        if (response.data.assignment.submission?.submission_text) {
          setSubmissionText(response.data.assignment.submission.submission_text);
        }
      } else {
        console.log('StudentAssignmentDetail: Assignment not found or API error');
        Alert.alert('Error', 'Assignment not found');
        navigation.goBack();
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error fetching assignment details:', error.message);
      Alert.alert('Error', 'Failed to load assignment details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      console.log('StudentAssignmentDetail: Starting document picker...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
        copyToCacheDirectory: true,
      });

      console.log('StudentAssignmentDetail: Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('StudentAssignmentDetail: Selected file:', file);
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          Alert.alert('Error', 'File size must be less than 10MB');
          return;
        }
        
        const newFile = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        };
        
        console.log('StudentAssignmentDetail: Adding file to attachments:', newFile);
        setAttachedFiles(prev => [...prev, newFile]);
        Alert.alert('Success', `File "${file.name}" added successfully!`);
      } else {
        console.log('StudentAssignmentDetail: Document picker was canceled');
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error picking document:', error);
      Alert.alert('Error', `Failed to pick document: ${error.message}`);
    }
  };

  const pickImage = async () => {
    try {
      console.log('StudentAssignmentDetail: Starting image picker...');
      
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('StudentAssignmentDetail: Permission result:', permissionResult);
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library to upload images.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('StudentAssignmentDetail: Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('StudentAssignmentDetail: Selected image:', image);
        
        if (image.fileSize > 10 * 1024 * 1024) { // 10MB limit
          Alert.alert('Error', 'Image size must be less than 10MB');
          return;
        }
        
        const newFile = {
          uri: image.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: image.fileSize,
        };
        
        console.log('StudentAssignmentDetail: Adding image to attachments:', newFile);
        setAttachedFiles(prev => [...prev, newFile]);
        Alert.alert('Success', `Image added successfully!`);
      } else {
        console.log('StudentAssignmentDetail: Image picker was canceled');
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error picking image:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const showFilePicker = () => {
    console.log('StudentAssignmentDetail: showFilePicker called');
    setShowFilePickerModal(true);
  };

  const handleDocumentPick = () => {
    console.log('StudentAssignmentDetail: Document option selected');
    setShowFilePickerModal(false);
    pickDocument();
  };

  const handleImagePick = () => {
    console.log('StudentAssignmentDetail: Image option selected');
    setShowFilePickerModal(false);
    pickImage();
  };

  const handleCancelFilePicker = () => {
    console.log('StudentAssignmentDetail: File picker canceled');
    setShowFilePickerModal(false);
  };

  const handleSubmitAssignment = async () => {
    if (!submissionText.trim() && attachedFiles.length === 0) {
      Alert.alert('Error', 'Please enter submission text or upload a file');
      return;
    }

    try {
      setSubmitting(true);
      console.log('StudentAssignmentDetail: Submitting assignment...');
      
      // Convert files to the format expected by the API
      const files = attachedFiles.map(file => ({
        uri: file.uri,
        name: file.name,
        type: file.type,
      }));
      
      let response;
      if (isSubmitted) {
        response = await apiClient.updateStudentSubmission(assignmentId, submissionText.trim(), files, { replaceAttachments });
      } else {
        response = await apiClient.submitStudentAssignment(assignmentId, submissionText.trim(), files);
      }
      console.log('StudentAssignmentDetail: Submit assignment response:', response);
      
      if (response?.success) {
        Alert.alert('Success', 'Assignment submitted successfully!');
        setAttachedFiles([]); // Clear attached files
        setIsEditing(false);
        setReplaceAttachments(false);
        fetchAssignmentDetails(); // Refresh to show updated submission status
      } else {
        Alert.alert('Error', response?.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error submitting assignment:', error.message);
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('already submitted')) {
        setAlreadySubmittedNotice(true);
        Alert.alert('Already submitted', 'Your assignment appears to be already submitted. Showing latest status.');
        // Re-fetch to sync UI with backend authoritative state
        fetchAssignmentDetails();
      } else {
        Alert.alert('Error', 'Failed to submit assignment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const viewSubmittedFile = async (attachment) => {
    try {
      console.log('StudentAssignmentDetail: Viewing submitted file...');
      
      // For student's own files, we can use the file URL directly if available
      if (attachment.file_url) {
        const fileUrl = attachment.file_url;
        
        // Check if it's an image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const isImage = imageExtensions.some(ext => 
          attachment.filename.toLowerCase().endsWith(ext)
        );
        
        if (isImage) {
          // For images, show in browser or download
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
            downloadSubmittedFile(attachment);
          }
        }
      } else {
        // If no direct URL, try to download
        downloadSubmittedFile(attachment);
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error viewing file:', error.message);
      Alert.alert('Error', 'Failed to view file. Please try downloading it instead.');
    }
  };

  const downloadSubmittedFile = async (attachment) => {
    try {
      console.log('StudentAssignmentDetail: Downloading submitted file...');
      
      if (attachment.file_url) {
        const fileUrl = attachment.file_url;
        const fileName = attachment.filename || `submitted_file_${Date.now()}`;
        
        // Download the file
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
      } else {
        throw new Error('File URL not available');
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error downloading file:', error.message);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const viewAssignmentFile = async (attachment) => {
    try {
      console.log('StudentAssignmentDetail: Viewing assignment file...');
      
      const fileUrl = attachment.url;
      console.log('StudentAssignmentDetail: File URL:', fileUrl);
      
      if (fileUrl) {
        // Check if it's an image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const isImage = imageExtensions.some(ext => 
          (attachment.filename || '').toLowerCase().endsWith(ext)
        );
        
        if (Platform.OS === 'web') {
          console.log('StudentAssignmentDetail: Opening assignment file in new tab for web platform');
          // For web, use fetch with authentication header and create blob URL
          const token = await apiClient.getToken();
          console.log('StudentAssignmentDetail: Retrieved token:', token ? token.substring(0, 20) + '...' : 'null');
          
          try {
            const response = await fetch(fileUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              console.log('StudentAssignmentDetail: File loaded successfully, size:', blob.size);
              
              // Check if it's a text file that can be previewed
              const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.log', '.js', '.html', '.css'];
              const isTextFile = textExtensions.some(ext => 
                (attachment.filename || '').toLowerCase().endsWith(ext)
              );
              
              if (isTextFile) {
                // For text files, show preview in modal
                const text = await blob.text();
                setPreviewContent(text);
                setPreviewFileName(attachment.filename);
                setPreviewFileType('text');
                setPreviewModalVisible(true);
              } else if (isImage) {
                // For images, show in modal
                const blobUrl = URL.createObjectURL(blob);
                setPreviewBlobUrl(blobUrl);
                setPreviewFileName(attachment.filename);
                setPreviewFileType('image');
                setPreviewModalVisible(true);
              } else {
                // For other files, open in new tab
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              }
            } else {
              console.log('StudentAssignmentDetail: Fetch failed:', response.status, response.statusText);
              Alert.alert('Error', `Failed to load file: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.log('StudentAssignmentDetail: Fetch error:', error);
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
              downloadAssignmentFile(attachment);
            }
          }
        }
      } else {
        throw new Error('File URL not available');
      }
    } catch (error) {
      console.log('StudentAssignmentDetail: Error viewing assignment file:', error.message);
      Alert.alert('Error', 'Failed to view file. Please try downloading it instead.');
    }
  };

  const downloadAssignmentFile = async (attachment) => {
    try {
      console.log('StudentAssignmentDetail: Downloading assignment file...');
      
      const fileUrl = attachment.url;
      const fileName = attachment.filename || attachment.originalName || 'assignment_file';
      
      if (Platform.OS === 'web') {
        console.log('StudentAssignmentDetail: Creating download link for web platform');
        console.log('StudentAssignmentDetail: File name:', fileName);
        
        const token = await apiClient.getToken();
        try {
          const response = await fetch(fileUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            console.log('StudentAssignmentDetail: Created blob URL for download:', blobUrl);
            
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
            console.log('StudentAssignmentDetail: Fetch failed:', response.status, response.statusText);
            Alert.alert('Error', `Failed to download file: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.log('StudentAssignmentDetail: Fetch error:', error);
          Alert.alert('Error', 'Failed to download file. Please try again.');
        }
      } else {
        // For mobile, download using FileSystem
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
              mimeType: attachment.mimetype || 'application/octet-stream',
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
    } catch (error) {
      console.log('StudentAssignmentDetail: Error downloading assignment file:', error.message);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const getStatusColor = (dueDate, submission) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        return '#10b981'; // Green for graded
      } else {
        return '#3b82f6'; // Blue for submitted
      }
    } else if (now > due) {
      return '#ef4444'; // Red for overdue
    } else {
      return '#f59e0b'; // Yellow for pending
    }
  };

  const getStatusText = (dueDate, submission) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        return `Graded: ${submission.grade}/${assignment?.max_points || 'N/A'}`;
      } else {
        return 'Submitted';
      }
    } else if (now > due) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  };

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

  const isSubmitted = assignment.submission && assignment.submission.id;
  const isGraded = assignment.submission && assignment.submission.grade !== null && assignment.submission.grade !== undefined;
  const isOverdue = new Date() > new Date(assignment.due_date) && !isSubmitted;

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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.due_date, assignment.submission) }]}>
            <Text style={styles.statusText}>{getStatusText(assignment.due_date, assignment.submission)}</Text>
          </View>
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

          {/* Assignment Files */}
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
                          console.log('StudentAssignmentDetail: View assignment file');
                          console.log('StudentAssignmentDetail: Attachment:', attachment);
                          viewAssignmentFile(attachment);
                        }}
                      >
                        <Text style={styles.viewFileButtonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadFileButton}
                        onPress={() => {
                          console.log('StudentAssignmentDetail: Download assignment file');
                          console.log('StudentAssignmentDetail: Attachment:', attachment);
                          downloadAssignmentFile(attachment);
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

          <View style={styles.dueDateInfo}>
            <Text style={[
              styles.dueDateText,
              { color: getStatusColor(assignment.due_date, assignment.submission) }
            ]}>
              {getDaysUntilDue(assignment.due_date)}
            </Text>
          </View>
        </View>

        {/* Submission Section */}
        <View style={styles.submissionCard}>
          <Text style={styles.sectionTitle}>Your Submission</Text>
          
          {isSubmitted && !isEditing ? (
            <View style={styles.submittedContainer}>
              <View style={styles.submissionInfo}>
                <Text style={styles.submissionDate}>
                  Submitted: {formatDate(assignment.submission.submitted_at)}
                </Text>
                
                {assignment.submission.submission_text && (
                  <View style={styles.submissionTextContainer}>
                    <Text style={styles.submissionTextLabel}>Your Submission:</Text>
                    <Text style={styles.submissionText}>{assignment.submission.submission_text}</Text>
                  </View>
                )}

                {assignment.submission.attachments && assignment.submission.attachments.length > 0 && (
                  <View style={styles.submittedFilesContainer}>
                    <Text style={styles.submittedFilesLabel}>Submitted Files:</Text>
                    {assignment.submission.attachments.map((attachment, index) => (
                      <View key={index} style={styles.submittedFileItem}>
                        <View style={styles.submittedFileInfo}>
                          <Text style={styles.submittedFileName}>
                            📎 {attachment.filename}
                          </Text>
                          {attachment.file_size && (
                            <Text style={styles.submittedFileSize}>
                              ({(attachment.file_size / 1024 / 1024).toFixed(2)} MB)
                            </Text>
                          )}
                        </View>
                        <View style={styles.submittedFileActions}>
                          <TouchableOpacity
                            style={styles.viewSubmittedFileButton}
                            onPress={() => viewSubmittedFile(attachment)}
                          >
                            <Text style={styles.viewSubmittedFileButtonText}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.downloadSubmittedFileButton}
                            onPress={() => downloadSubmittedFile(attachment)}
                          >
                            <Text style={styles.downloadSubmittedFileButtonText}>Download</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                {isGraded && (
                  <View style={styles.gradeContainer}>
                    <Text style={styles.gradeLabel}>Grade:</Text>
                    <Text style={styles.gradeText}>
                      {assignment.submission.grade}/{assignment.max_points}
                    </Text>
                  </View>
                )}
                
                {assignment.submission.feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackLabel}>Teacher Feedback:</Text>
                    <Text style={styles.feedbackText}>{assignment.submission.feedback}</Text>
                  </View>
                )}
              </View>
              <View style={{ marginTop: 12 }}>
                {!isOverdue && (
                  <TouchableOpacity style={[styles.addFileButton, { backgroundColor: '#1a237e' }]} onPress={() => setIsEditing(true)}>
                    <Text style={styles.addFileButtonText}>Edit Submission</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.submitContainer}>
              {alreadySubmittedNotice && (
                <Text style={styles.alreadySubmittedBanner}>
                  This assignment was already submitted. If you need to update it, contact your teacher.
                </Text>
              )}
              {isSubmitted && (
                <View style={[styles.attachedFilesContainer, { marginBottom: 8 }]}> 
                  <Text style={styles.fileUploadLabel}>Edit Mode</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => setReplaceAttachments(v => !v)} style={[styles.chip, replaceAttachments && styles.chipActive]}> 
                      <Text style={[styles.chipText, replaceAttachments && styles.chipTextActive]}>
                        {replaceAttachments ? 'Replace all files' : 'Append files'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <Text style={styles.submitLabel}>Submission Text:</Text>
              <TextInput
                style={styles.submissionInput}
                value={submissionText}
                onChangeText={setSubmissionText}
                placeholder="Enter your submission here..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!isOverdue}
              />
              
              {/* File Upload Section */}
              <View style={styles.fileUploadSection}>
                <Text style={styles.fileUploadLabel}>Attachments:</Text>
                
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
                          disabled={isOverdue}
                        >
                          <Text style={styles.removeFileButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.addFileButton,
                    isOverdue && styles.addFileButtonDisabled
                  ]}
                  onPress={() => {
                    console.log('StudentAssignmentDetail: Add File button pressed');
                    console.log('StudentAssignmentDetail: isOverdue:', isOverdue);
                    console.log('StudentAssignmentDetail: attachedFiles.length:', attachedFiles.length);
                    showFilePicker();
                  }}
                  disabled={isOverdue || attachedFiles.length >= 5}
                >
                  <Text style={styles.addFileButtonText}>
                    {attachedFiles.length >= 5 ? 'Max 5 files' : '+ Add File'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.fileUploadHint}>
                  Supported: PDF, DOC, DOCX, TXT, ZIP, Images (Max 10MB each, 5 files max)
                </Text>
              </View>
              
              {isOverdue && (
                <Text style={styles.overdueWarning}>
                  This assignment is overdue and cannot be submitted.
                </Text>
              )}
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (submitting || isOverdue || (!submissionText.trim() && attachedFiles.length === 0)) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitAssignment}
                disabled={submitting || isOverdue || (!submissionText.trim() && attachedFiles.length === 0)}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : isOverdue ? 'Overdue' : 'Submit Assignment'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* File Picker Modal */}
      <Modal
        visible={showFilePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelFilePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add File</Text>
            <Text style={styles.modalSubtitle}>Choose the type of file you want to upload</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.documentButton]}
                onPress={handleDocumentPick}
              >
                <Text style={styles.modalButtonText}>📄 Document</Text>
                <Text style={styles.modalButtonSubtext}>PDF, DOC, DOCX, TXT, ZIP</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.imageButton]}
                onPress={handleImagePick}
              >
                <Text style={styles.modalButtonText}>🖼️ Image</Text>
                <Text style={styles.modalButtonSubtext}>JPG, PNG, GIF, etc.</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancelFilePicker}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  dueDateInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dueDateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submissionCard: {
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
  submittedContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  submissionInfo: {
    // Container for submission details
  },
  submissionDate: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  submissionTextContainer: {
    marginBottom: 12,
  },
  submissionTextLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  submissionText: {
    color: '#1e40af',
    fontSize: 14,
    lineHeight: 20,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  gradeText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  feedbackLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#1e40af',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  submitContainer: {
    // Container for submission form
  },
  submitLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  submissionInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
    marginBottom: 12,
  },
  overdueWarning: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  alreadySubmittedBanner: {
    color: '#92400e',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
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
  fileUploadSection: {
    marginTop: 16,
  },
  fileUploadLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  addFileButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, marginRight: 8 },
  chipActive: { backgroundColor: '#e8eaf6', borderColor: '#1a237e' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#1a237e', fontWeight: '700' },
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
  submittedFilesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  submittedFilesLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  submittedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  submittedFileInfo: {
    flex: 1,
  },
  submittedFileName: {
    color: '#0c4a6e',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  submittedFileSize: {
    color: '#0369a1',
    fontSize: 11,
  },
  submittedFileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewSubmittedFileButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  viewSubmittedFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadSubmittedFileButton: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  downloadSubmittedFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    marginBottom: 16,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  documentButton: {
    backgroundColor: '#3b82f6',
  },
  imageButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  modalButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Attachment styles
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  attachmentSize: {
    color: '#6b7280',
    fontSize: 12,
  },
  attachmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewFileButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadFileButton: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  downloadFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noSubmissionsSubtext: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
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
  closeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default StudentAssignmentDetailScreen;
