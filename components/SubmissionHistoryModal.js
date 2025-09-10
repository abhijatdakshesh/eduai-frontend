import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { theme } from '../config/theme';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const SubmissionHistoryModal = ({ visible, onClose, submissionId, isTeacher = false }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (visible && submissionId) {
      fetchSubmissionHistory();
    }
  }, [visible, submissionId]);

  const fetchSubmissionHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSubmissionHistory(submissionId);
      if (response?.success) {
        setHistory(response.data?.history || []);
      } else {
        Alert.alert('Error', 'Failed to load submission history');
      }
    } catch (error) {
      console.log('Error fetching submission history:', error);
      Alert.alert('Error', 'Failed to load submission history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return theme.colors.info;
      case 'graded': return theme.colors.success;
      case 'late': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const renderHistoryItem = ({ item, index }) => {
    const isLatest = index === 0;
    const isSelected = selectedVersion === item.version;
    
    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          isLatest && styles.latestItem,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => setSelectedVersion(item.version)}
      >
        <View style={styles.historyHeader}>
          <View style={styles.versionInfo}>
            <Text style={[styles.versionText, isLatest && styles.latestVersionText]}>
              Version {item.version}
              {isLatest && ' (Current)'}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(item.updated_at)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {item.last_updated_reason && (
          <Text style={styles.reasonText}>
            Reason: {item.last_updated_reason}
          </Text>
        )}
        
        {item.updated_by && (
          <Text style={styles.updatedByText}>
            Updated by: {item.updated_by_name || 'Unknown'}
          </Text>
        )}
        
        {isSelected && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Submission Details:</Text>
            {item.submission_text && (
              <Text style={styles.submissionText}>
                {item.submission_text.length > 200 
                  ? `${item.submission_text.substring(0, 200)}...` 
                  : item.submission_text
                }
              </Text>
            )}
            
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsTitle}>Attachments:</Text>
                {item.attachments.map((attachment, idx) => (
                  <Text key={idx} style={styles.attachmentText}>
                    • {attachment.filename}
                  </Text>
                ))}
              </View>
            )}
            
            {isTeacher && item.grade && (
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeText}>
                  Grade: {item.grade}/{item.max_points || 'N/A'}
                </Text>
                {item.feedback && (
                  <Text style={styles.feedbackText}>
                    Feedback: {item.feedback}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Submission History</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submission history found</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => `${item.version}-${item.updated_at}`}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.medium,
  },
  latestItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  versionInfo: {
    flex: 1,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  latestVersionText: {
    color: theme.colors.success,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  updatedByText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  submissionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  attachmentsContainer: {
    marginBottom: 8,
  },
  attachmentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  attachmentText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  gradeContainer: {
    backgroundColor: theme.colors.inputBackground,
    padding: 8,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  feedbackText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});

export default SubmissionHistoryModal;
