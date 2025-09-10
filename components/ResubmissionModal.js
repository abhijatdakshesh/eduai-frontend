import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../config/theme';

const isIOS = Platform.OS === 'ios';

const ResubmissionModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  currentSubmission = null,
  loading = false 
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [replaceAttachments, setReplaceAttachments] = useState(false);
  const [reason, setReason] = useState('');

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
        }));
        
        if (replaceAttachments) {
          setAttachedFiles(newFiles);
        } else {
          setAttachedFiles(prev => [...prev, ...newFiles]);
        }
      }
    } catch (error) {
      console.log('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize,
        }));
        
        if (replaceAttachments) {
          setAttachedFiles(newImages);
        } else {
          setAttachedFiles(prev => [...prev, ...newImages]);
        }
      }
    } catch (error) {
      console.log('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!submissionText.trim() && attachedFiles.length === 0) {
      Alert.alert('Error', 'Please provide submission text or attach files');
      return;
    }

    onSubmit({
      submissionText: submissionText.trim(),
      files: attachedFiles,
      options: {
        replaceAttachments,
        reason: reason.trim() || 'Resubmission',
      },
    });
  };

  const resetForm = () => {
    setSubmissionText('');
    setAttachedFiles([]);
    setReplaceAttachments(false);
    setReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Resubmit Assignment</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Submission Info */}
          {currentSubmission && (
            <View style={styles.currentSubmissionContainer}>
              <Text style={styles.sectionTitle}>Current Submission</Text>
              <Text style={styles.currentVersionText}>
                Version {currentSubmission.version || 1}
              </Text>
              {currentSubmission.submission_text && (
                <Text style={styles.currentText}>
                  {currentSubmission.submission_text.length > 100 
                    ? `${currentSubmission.submission_text.substring(0, 100)}...` 
                    : currentSubmission.submission_text
                  }
                </Text>
              )}
            </View>
          )}

          {/* Resubmission Text */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Text</Text>
            <TextInput
              style={styles.textInput}
              value={submissionText}
              onChangeText={setSubmissionText}
              placeholder="Enter your updated submission text..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* File Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>File Attachments</Text>
            
            <View style={styles.fileOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !replaceAttachments && styles.optionButtonSelected
                ]}
                onPress={() => setReplaceAttachments(false)}
              >
                <Text style={[
                  styles.optionButtonText,
                  !replaceAttachments && styles.optionButtonTextSelected
                ]}>
                  📎 Append Files
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  replaceAttachments && styles.optionButtonSelected
                ]}
                onPress={() => setReplaceAttachments(true)}
              >
                <Text style={[
                  styles.optionButtonText,
                  replaceAttachments && styles.optionButtonTextSelected
                ]}>
                  🔄 Replace Files
                </Text>
              </TouchableOpacity>
            </View>

            {/* File Picker Buttons */}
            <View style={styles.filePickerContainer}>
              <TouchableOpacity style={styles.filePickerButton} onPress={handleFilePicker}>
                <Text style={styles.filePickerButtonText}>📄 Add Documents</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filePickerButton} onPress={handleImagePicker}>
                <Text style={styles.filePickerButtonText}>📷 Add Images</Text>
              </TouchableOpacity>
            </View>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <View style={styles.filesListContainer}>
                <Text style={styles.filesListTitle}>Attached Files:</Text>
                {attachedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => removeFile(index)}
                    >
                      <Text style={styles.removeFileButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Resubmission</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Fixed errors, Added more content, Corrected formatting..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Version Info */}
          <View style={styles.versionInfoContainer}>
            <Text style={styles.versionInfoText}>
              ℹ️ This will create a new version of your submission. 
              Previous versions will be preserved in the history.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? '⏳ Submitting...' : '📤 Resubmit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentSubmissionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  currentVersionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  currentText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 120,
  },
  fileOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  filePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filePickerButton: {
    flex: 1,
    backgroundColor: theme.colors.info,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  filePickerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filesListContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.small,
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
  },
  removeFileButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 80,
  },
  versionInfoContainer: {
    backgroundColor: theme.colors.info + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  versionInfoText: {
    fontSize: 12,
    color: theme.colors.info,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default ResubmissionModal;
