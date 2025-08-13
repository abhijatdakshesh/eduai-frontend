import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformSegmentedButtons,
  PlatformProgressBar,
  PlatformBadge,
  PlatformList,
  PlatformModal,
  PlatformInput,
  PlatformSnackbar,
} from '../components/PlatformWrapper';

const FeesAndScholarshipScreen = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [scholarshipModalVisible, setScholarshipModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const tabs = [
    { value: 'fees', label: 'Fee Summary' },
    { value: 'scholarships', label: 'Scholarships' },
    { value: 'history', label: 'Payment History' },
  ];

  const feeData = {
    totalAmount: 15000,
    paidAmount: 8500,
    remainingAmount: 6500,
    dueDate: '2024-05-15',
    breakdown: [
      { item: 'Tuition Fee', amount: 12000, paid: 8000 },
      { item: 'Library Fee', amount: 500, paid: 500 },
      { item: 'Laboratory Fee', amount: 1500, paid: 0 },
      { item: 'Student Activity Fee', amount: 1000, paid: 0 },
    ],
  };

  const scholarships = [
    {
      id: 1,
      name: 'Merit Scholarship',
      amount: 5000,
      status: 'approved',
      description: 'Awarded for outstanding academic performance',
      requirements: ['GPA 3.8+', 'Full-time enrollment', 'No disciplinary record'],
      deadline: '2024-03-15',
    },
    {
      id: 2,
      name: 'Need-Based Grant',
      amount: 3000,
      status: 'pending',
      description: 'Financial assistance based on demonstrated need',
      requirements: ['Income verification', 'FAFSA completion', 'Full-time enrollment'],
      deadline: '2024-04-01',
    },
    {
      id: 3,
      name: 'Department Scholarship',
      amount: 2000,
      status: 'available',
      description: 'Department-specific scholarship for Computer Science students',
      requirements: ['CS major', 'GPA 3.5+', 'Faculty recommendation'],
      deadline: '2024-05-01',
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 3000,
      method: 'Credit Card',
      status: 'completed',
      description: 'Tuition Fee Payment',
    },
    {
      id: 2,
      date: '2024-02-01',
      amount: 2500,
      method: 'Bank Transfer',
      status: 'completed',
      description: 'Tuition Fee Payment',
    },
    {
      id: 3,
      date: '2024-02-15',
      amount: 500,
      method: 'Credit Card',
      status: 'completed',
      description: 'Library Fee',
    },
    {
      id: 4,
      date: '2024-03-01',
      amount: 2500,
      method: 'Scholarship',
      status: 'completed',
      description: 'Merit Scholarship Credit',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'available': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#f44336';
      default: return '#666';
    }
  };

  const handlePayment = () => {
    setSnackbarMessage('Payment processed successfully!');
    setSnackbarVisible(true);
    setPaymentModalVisible(false);
  };

  const handleScholarshipApplication = () => {
    setSnackbarMessage('Scholarship application submitted!');
    setSnackbarVisible(true);
    setScholarshipModalVisible(false);
  };

  const renderFeeSummary = () => (
    <ScrollView>
      <PlatformCard style={styles.summaryCard}>
        <Title style={styles.cardTitle}>Fee Summary</Title>
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Paragraph style={styles.totalLabel}>Total Amount:</Paragraph>
            <Title style={styles.totalAmount}>${feeData.totalAmount.toLocaleString()}</Title>
          </View>
          <View style={styles.totalRow}>
            <Paragraph style={styles.totalLabel}>Paid Amount:</Paragraph>
            <Title style={styles.paidAmount}>${feeData.paidAmount.toLocaleString()}</Title>
          </View>
          <View style={styles.totalRow}>
            <Paragraph style={styles.totalLabel}>Remaining:</Paragraph>
            <Title style={styles.remainingAmount}>${feeData.remainingAmount.toLocaleString()}</Title>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Paragraph style={styles.progressLabel}>Payment Progress</Paragraph>
          <PlatformProgressBar 
            progress={feeData.paidAmount / feeData.totalAmount} 
            color="#4CAF50" 
            style={styles.progressBar}
          />
          <Paragraph style={styles.progressText}>
            {Math.round((feeData.paidAmount / feeData.totalAmount) * 100)}% Complete
          </Paragraph>
        </View>

        <View style={styles.dueDateSection}>
          <Paragraph style={styles.dueDateLabel}>Due Date:</Paragraph>
          <PlatformBadge style={styles.dueDateBadge}>{feeData.dueDate}</PlatformBadge>
        </View>

        <PlatformButton
          mode="contained"
          onPress={() => setPaymentModalVisible(true)}
          style={styles.payButton}
        >
          Pay Remaining Balance
        </PlatformButton>
      </PlatformCard>

      <PlatformCard style={styles.breakdownCard}>
        <Title style={styles.cardTitle}>Fee Breakdown</Title>
        {feeData.breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Paragraph style={styles.breakdownLabel}>{item.item}</Paragraph>
              <Paragraph style={styles.breakdownAmount}>${item.amount.toLocaleString()}</Paragraph>
            </View>
            <View style={styles.breakdownProgress}>
              <PlatformProgressBar 
                progress={item.paid / item.amount} 
                color="#1976d2" 
                style={styles.itemProgressBar}
              />
              <Paragraph style={styles.breakdownPaid}>
                Paid: ${item.paid.toLocaleString()}
              </Paragraph>
            </View>
          </View>
        ))}
      </PlatformCard>
    </ScrollView>
  );

  const renderScholarships = () => (
    <ScrollView>
      {scholarships.map(scholarship => (
        <PlatformCard key={scholarship.id} style={styles.scholarshipCard}>
          <View style={styles.scholarshipHeader}>
            <View style={styles.scholarshipInfo}>
              <Title style={styles.scholarshipName}>{scholarship.name}</Title>
              <Paragraph style={styles.scholarshipAmount}>${scholarship.amount.toLocaleString()}</Paragraph>
            </View>
            <PlatformBadge style={[styles.statusBadge, { backgroundColor: getStatusColor(scholarship.status) }]}>
              {scholarship.status.toUpperCase()}
            </PlatformBadge>
          </View>

          <Paragraph style={styles.scholarshipDescription}>{scholarship.description}</Paragraph>

          <View style={styles.requirementsSection}>
            <Paragraph style={styles.requirementsTitle}>Requirements:</Paragraph>
            {scholarship.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Paragraph style={styles.bulletPoint}>•</Paragraph>
                <Paragraph style={styles.requirementText}>{req}</Paragraph>
              </View>
            ))}
          </View>

          <View style={styles.scholarshipFooter}>
            <Paragraph style={styles.deadline}>Deadline: {scholarship.deadline}</Paragraph>
            {scholarship.status === 'available' && (
              <PlatformButton
                mode="contained"
                onPress={() => setScholarshipModalVisible(true)}
                style={styles.applyButton}
                compact
              >
                Apply Now
              </PlatformButton>
            )}
          </View>
        </PlatformCard>
      ))}
    </ScrollView>
  );

  const renderPaymentHistory = () => (
    <ScrollView>
      {paymentHistory.map(payment => (
        <PlatformCard key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Title style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Title>
              <Paragraph style={styles.paymentDescription}>{payment.description}</Paragraph>
              <Paragraph style={styles.paymentDate}>{payment.date}</Paragraph>
            </View>
            <View style={styles.paymentMeta}>
              <PlatformBadge style={[styles.paymentStatus, { backgroundColor: getStatusColor(payment.status) }]}>
                {payment.status.toUpperCase()}
              </PlatformBadge>
              <Paragraph style={styles.paymentMethod}>{payment.method}</Paragraph>
            </View>
          </View>
        </PlatformCard>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <PlatformSegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={tabs}
        style={styles.tabs}
      />

      <View style={styles.content}>
        {activeTab === 'fees' && renderFeeSummary()}
        {activeTab === 'scholarships' && renderScholarships()}
        {activeTab === 'history' && renderPaymentHistory()}
      </View>

      {/* Payment Modal */}
      <PlatformModal
        visible={paymentModalVisible}
        onDismiss={() => setPaymentModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>Make Payment</Title>
        <Paragraph style={styles.modalAmount}>Amount: ${feeData.remainingAmount.toLocaleString()}</Paragraph>
        
        <PlatformInput
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          style={styles.modalInput}
        />
        <View style={styles.cardRow}>
          <PlatformInput
            label="Expiry"
            placeholder="MM/YY"
            style={[styles.modalInput, styles.halfInput]}
          />
          <PlatformInput
            label="CVV"
            placeholder="123"
            style={[styles.modalInput, styles.halfInput]}
          />
        </View>
        <PlatformInput
          label="Cardholder Name"
          placeholder="John Doe"
          style={styles.modalInput}
        />

        <View style={styles.modalButtons}>
          <PlatformButton
            mode="outlined"
            onPress={() => setPaymentModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </PlatformButton>
          <PlatformButton
            mode="contained"
            onPress={handlePayment}
            style={styles.modalButton}
          >
            Pay Now
          </PlatformButton>
        </View>
      </PlatformModal>

      {/* Scholarship Application Modal */}
      <PlatformModal
        visible={scholarshipModalVisible}
        onDismiss={() => setScholarshipModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>Apply for Scholarship</Title>
        
        <PlatformInput
          label="Full Name"
          placeholder="Enter your full name"
          style={styles.modalInput}
        />
        <PlatformInput
          label="Student ID"
          placeholder="Enter your student ID"
          style={styles.modalInput}
        />
        <PlatformInput
          label="GPA"
          placeholder="Enter your current GPA"
          keyboardType="numeric"
          style={styles.modalInput}
        />
        <PlatformInput
          label="Essay"
          placeholder="Write a brief essay about why you deserve this scholarship..."
          multiline
          numberOfLines={4}
          style={styles.modalInput}
        />

        <View style={styles.modalButtons}>
          <PlatformButton
            mode="outlined"
            onPress={() => setScholarshipModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </PlatformButton>
          <PlatformButton
            mode="contained"
            onPress={handleScholarshipApplication}
            style={styles.modalButton}
          >
            Submit Application
          </PlatformButton>
        </View>
      </PlatformModal>

      <PlatformSnackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </PlatformSnackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    margin: 16,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paidAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
  dueDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dueDateLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  dueDateBadge: {
    backgroundColor: '#FF9800',
  },
  payButton: {
    paddingVertical: 8,
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontWeight: 'bold',
  },
  breakdownAmount: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  breakdownProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemProgressBar: {
    flex: 1,
    height: 4,
    marginRight: 8,
  },
  breakdownPaid: {
    fontSize: 12,
    color: '#666',
  },
  scholarshipCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  scholarshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scholarshipInfo: {
    flex: 1,
  },
  scholarshipName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scholarshipAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusBadge: {
    marginLeft: 8,
  },
  scholarshipDescription: {
    marginBottom: 12,
    color: '#666',
  },
  requirementsSection: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    color: '#1976d2',
  },
  requirementText: {
    flex: 1,
    fontSize: 12,
  },
  scholarshipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#666',
  },
  applyButton: {
    paddingHorizontal: 16,
  },
  paymentCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  paymentDescription: {
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentMeta: {
    alignItems: 'flex-end',
  },
  paymentStatus: {
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1976d2',
  },
  modalInput: {
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default FeesAndScholarshipScreen; 