import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';

const ParentNotificationModal = ({
  visible,
  onClose,
  student,
  attendanceStatus,
  date,
  notes,
  communicationType, // 'whatsapp' or 'ai_call'
  onProceed,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);

  useEffect(() => {
    if (visible && student) {
      // Simulate fetching parent information
      // In a real app, this would come from your API
      setParentInfo({
        name: 'John Smith', // Parent name
        phone: '+1234567890', // Parent phone
        relationship: 'Father',
        email: 'parent@example.com',
      });
    }
  }, [visible, student]);

  const getStudentDetails = () => {
    if (!student) return '';
    
    const fullName = student.first_name && student.last_name 
      ? `${student.first_name} ${student.last_name}`
      : student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';
    
    const studentId = student.student_id || student.roll_number || student.id;
    
    return {
      name: fullName,
      id: studentId,
      class: student.class_name || 'N/A',
      section: student.section || 'N/A',
    };
  };

  const generateWhatsAppMessage = () => {
    const studentDetails = getStudentDetails();
    const statusText = (attendanceStatus === 'absent' ? 'absent' : attendanceStatus === 'late' ? 'late' : 'unknown');
    const reasonText = notes ? `\nReason: ${notes}` : '';
    
    return `Dear ${parentInfo?.name || 'Parent/Guardian'},

I am writing to inform you about your ward's attendance:

Student Details:
• Name: ${studentDetails.name}
• Student ID: ${studentDetails.id}
• Class: ${studentDetails.class}
• Section: ${studentDetails.section}

Attendance Status: ${statusText.toUpperCase()} on ${date}${reasonText}

Please ensure regular attendance for better academic performance.

Best regards,
Teacher`;
  };

  const generateAICallScript = () => {
    const studentDetails = getStudentDetails();
    const statusText = (attendanceStatus === 'absent' ? 'absent' : attendanceStatus === 'late' ? 'late' : 'unknown');
    const reasonText = notes ? ` The reason provided is: ${notes}.` : '';
    
    return `Hello ${parentInfo?.name || 'Parent/Guardian'}, this is an automated call from the school regarding your ward's attendance.

Student Information:
• Name: ${studentDetails.name}
• Student ID: ${studentDetails.id}
• Class: ${studentDetails.class}
• Section: ${studentDetails.section}

Your ward was marked as ${statusText.toUpperCase()} on ${date}.${reasonText}

Please ensure regular attendance for better academic performance. If you have any questions, please contact the school office.

Thank you for your attention.`;
  };

  const handleProceed = async () => {
    setIsLoading(true);
    
    try {
      if (communicationType === 'whatsapp') {
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${parentInfo?.phone?.replace(/[^0-9]/g, '') || '1234567890'}?text=${encodeURIComponent(message)}`;
        
        if (Platform.OS === 'web') {
          window.open(whatsappUrl, '_blank');
        } else {
          await Linking.openURL(whatsappUrl);
        }
      } else if (communicationType === 'ai_call') {
        // Simulate AI call initiation
        // In a real app, this would call your AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
        Alert.alert(
          'AI Call Scheduled',
          'The AI call has been scheduled and will be made shortly to the parent.',
          [{ text: 'OK' }]
        );
      }
      
      if (onProceed) {
        onProceed();
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to ${communicationType === 'whatsapp' ? 'open WhatsApp' : 'initiate AI call'}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const studentDetails = getStudentDetails();

  // Safety check - don't render if essential props are missing
  if (!visible || !student || !attendanceStatus || !communicationType) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>
              {communicationType === 'whatsapp' ? '📱 WhatsApp Message Review' : '🤖 AI Call Review'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Student Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Details</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{studentDetails.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Student ID:</Text>
                  <Text style={styles.detailValue}>{studentDetails.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Class:</Text>
                  <Text style={styles.detailValue}>{studentDetails.class}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Section:</Text>
                  <Text style={styles.detailValue}>{studentDetails.section}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, styles[`status_${attendanceStatus || 'unknown'}`]]}>
                    {(attendanceStatus || 'unknown').toUpperCase()}
                  </Text>
                </View>
                {notes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason:</Text>
                    <Text style={styles.detailValue}>{notes}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Parent Information Section */}
            {parentInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parent Information</Text>
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{parentInfo.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Relationship:</Text>
                    <Text style={styles.detailValue}>{parentInfo.relationship}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{parentInfo.phone}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Message Preview Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {communicationType === 'whatsapp' ? 'Message Preview' : 'Call Script Preview'}
              </Text>
              <View style={styles.messagePreview}>
                <Text style={styles.messageText}>
                  {communicationType === 'whatsapp' ? generateWhatsAppMessage() : generateAICallScript()}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.proceedButton]}
              onPress={handleProceed}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.proceedButtonText}>
                  {communicationType === 'whatsapp' ? 'Send WhatsApp' : 'Initiate AI Call'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  status_absent: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  status_late: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  status_unknown: {
    color: '#6c757d',
    fontWeight: 'bold',
  },
  messagePreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ParentNotificationModal;
