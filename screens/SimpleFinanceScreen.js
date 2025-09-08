import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const SimpleFinanceScreen = () => {
  const [activeTab, setActiveTab] = useState('fees');

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
      deadline: '2024-03-15',
    },
    {
      id: 2,
      name: 'Need-Based Grant',
      amount: 3000,
      status: 'pending',
      description: 'Financial assistance based on demonstrated need',
      deadline: '2024-04-01',
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
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const renderFeeSummary = () => (
    <ScrollView>
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Fee Summary</Text>
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{feeData.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid Amount:</Text>
            <Text style={styles.paidAmount}>₹{feeData.paidAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remaining:</Text>
            <Text style={styles.remainingAmount}>₹{feeData.remainingAmount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Payment Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(feeData.paidAmount / feeData.totalAmount) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((feeData.paidAmount / feeData.totalAmount) * 100)}% Complete
          </Text>
        </View>

        <View style={styles.dueDateSection}>
          <Text style={styles.dueDateLabel}>Due Date:</Text>
          <View style={styles.dueDateBadge}>
            <Text style={styles.dueDateText}>{feeData.dueDate}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Remaining Balance</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Fee Breakdown</Text>
        {feeData.breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>{item.item}</Text>
              <Text style={styles.breakdownAmount}>₹{item.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownProgress}>
              <View style={styles.itemProgressBar}>
                <View 
                  style={[
                    styles.itemProgressFill, 
                    { width: `${(item.paid / item.amount) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownPaid}>
                Paid: ₹{item.paid.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderScholarships = () => (
    <ScrollView>
      {scholarships.map(scholarship => (
        <View key={scholarship.id} style={styles.scholarshipCard}>
          <View style={styles.scholarshipHeader}>
            <View style={styles.scholarshipInfo}>
              <Text style={styles.scholarshipName}>{scholarship.name}</Text>
              <Text style={styles.scholarshipAmount}>₹{scholarship.amount.toLocaleString()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(scholarship.status) }]}>
              <Text style={styles.statusText}>{scholarship.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.scholarshipDescription}>{scholarship.description}</Text>

          <View style={styles.scholarshipFooter}>
            <Text style={styles.deadline}>Deadline: {scholarship.deadline}</Text>
            {scholarship.status === 'available' && (
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPaymentHistory = () => (
    <ScrollView>
      {paymentHistory.map(payment => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentAmount}>₹{payment.amount.toLocaleString()}</Text>
              <Text style={styles.paymentDescription}>{payment.description}</Text>
              <Text style={styles.paymentDate}>{payment.date}</Text>
            </View>
            <View style={styles.paymentMeta}>
              <View style={[styles.paymentStatus, { backgroundColor: getStatusColor(payment.status) }]}>
                <Text style={styles.paymentStatusText}>{payment.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.paymentMethod}>{payment.method}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'fees' && styles.activeTab]}
          onPress={() => setActiveTab('fees')}
        >
          <Text style={[styles.tabText, activeTab === 'fees' && styles.activeTabText]}>Fee Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scholarships' && styles.activeTab]}
          onPress={() => setActiveTab('scholarships')}
        >
          <Text style={[styles.tabText, activeTab === 'scholarships' && styles.activeTabText]}>Scholarships</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Payment History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'fees' && renderFeeSummary()}
        {activeTab === 'scholarships' && renderScholarships()}
        {activeTab === 'history' && renderPaymentHistory()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1a237e',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a237e',
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
    color: '#1a237e',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e8eaf6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
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
    color: '#1a237e',
  },
  dueDateBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueDateText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    color: '#1a237e',
  },
  breakdownAmount: {
    fontWeight: 'bold',
    color: '#1a237e',
  },
  breakdownProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e8eaf6',
    borderRadius: 2,
    marginRight: 8,
  },
  itemProgressFill: {
    height: '100%',
    backgroundColor: '#1a237e',
    borderRadius: 2,
  },
  breakdownPaid: {
    fontSize: 12,
    color: '#666',
  },
  scholarshipCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    color: '#1a237e',
  },
  scholarshipAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  scholarshipDescription: {
    marginBottom: 12,
    color: '#666',
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
    backgroundColor: '#1a237e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  paymentCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    color: '#1a237e',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentMeta: {
    alignItems: 'flex-end',
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
});

export default SimpleFinanceScreen;

