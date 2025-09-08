import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, TextInput, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentFeesScreen = ({ route }) => {
  const { studentId, childName } = route.params || {};
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      
      // If we have a studentId, try to load real data
      if (studentId) {
        const resp = await apiClient.getParentChildInvoices(studentId);
        if (resp?.success && resp.data?.invoices?.length > 0) {
          setInvoices(resp.data.invoices);
          return;
        }
      }
      
      // Show sample data when no studentId or API returns empty
      console.log('Showing sample data - studentId:', studentId);
      setInvoices(getSampleInvoices());
    } catch (e) {
      console.log('API call failed, showing sample data:', e?.message);
      // Show sample data when API fails
      setInvoices(getSampleInvoices());
    } finally {
      setLoading(false);
    }
  };

  const getSampleInvoices = () => [
    {
      id: 1,
      title: 'Tuition Fee - Fall 2024',
      amount_due: '₹2,50,000',
      due_date: '2024-09-15',
      status: 'pending',
      description: 'Semester tuition fee for Fall 2024'
    },
    {
      id: 2,
      title: 'Library Fee',
      amount_due: '₹15,000',
      due_date: '2024-09-01',
      status: 'paid',
      description: 'Annual library access fee'
    },
    {
      id: 3,
      title: 'Lab Equipment Fee',
      amount_due: '₹30,000',
      due_date: '2024-10-01',
      status: 'pending',
      description: 'Computer Science lab equipment fee'
    },
    {
      id: 4,
      title: 'Student Activity Fee',
      amount_due: '₹7,500',
      due_date: '2024-08-20',
      status: 'paid',
      description: 'Student activities and events fee'
    },
    {
      id: 5,
      title: 'Health Insurance',
      amount_due: '₹40,000',
      due_date: '2024-09-30',
      status: 'overdue',
      description: 'Student health insurance premium'
    }
  ];

  useEffect(() => { load(); }, []);

  const openInvoice = (inv) => {
    Alert.alert(
      inv.title, 
      `${inv.description || 'No description available'}\n\nAmount: ${inv.amount_due}\nDue Date: ${inv.due_date}\nStatus: ${inv.status.toUpperCase()}`,
      [
        { text: 'OK', style: 'default' },
        ...(inv.status === 'pending' || inv.status === 'overdue' ? 
          [{ text: 'Pay Now', style: 'default', onPress: () => handlePayment(inv) }] : 
          []
        )
      ]
    );
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalVisible(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;

    // Validate card details
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    setProcessingPayment(true);

    try {
      // Prepare amount in number (extract digits from formatted amount_due like ₹2,50,000)
      const numericAmount = Number(String(selectedInvoice.amount_due).replace(/[^\d.]/g, '')) || 0;

      // 1) Create order via backend
      const create = await apiClient.createCashfreeOrder({
        amount: numericAmount || 1, // fallback to 1 for sandbox
        customer: {
          id: `parent_${Date.now()}`,
          name: 'Parent User',
          email: 'parent@example.com',
          phone: '9999999999',
        },
      });

      if (!create?.success) {
        Alert.alert('Error', create?.message || 'Failed to create payment order');
        setProcessingPayment(false);
        return;
      }

      const { orderId, paymentSessionId } = create;

      if (Platform.OS === 'web') {
        // Ensure Cashfree JS SDK is present
        if (!window.Cashfree) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
        }
        const cashfree = window.Cashfree({ mode: (process.env.EXPO_PUBLIC_CF_MODE || 'sandbox') });
        await cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
        // After redirect completes, your return page should verify. As a safety, verify here too if needed.
      } else {
        // Mobile: open hosted checkout in system browser
        const url = `https://payments.cashfree.com/pg/view/checkout?payment_session_id=${encodeURIComponent(paymentSessionId)}`;
        await WebBrowser.openBrowserAsync(url);
        // After user returns, verify
        const verify = await apiClient.verifyCashfreeOrder(orderId);
        if (verify?.success && verify?.data?.order_status === 'PAID') {
          // Mark invoice as paid locally
          setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'paid' } : inv));
          setPaymentModalVisible(false);
          Alert.alert('Payment Successful', 'Your payment was successful.');
        } else {
          Alert.alert('Payment Pending', 'Payment was not completed.');
        }
      }
    } catch (error) {
      Alert.alert('Payment Error', error?.message || 'Failed to start payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedInvoice(null);
    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'PAID';
      case 'pending': return 'PENDING';
      case 'overdue': return 'OVERDUE';
      default: return status.toUpperCase();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fees - {childName || 'All Children'}</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Invoices and payments'}</Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openInvoice(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title || `Invoice ${item.id}`}</Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.amount}>{item.amount_due}</Text>
            <Text style={styles.meta}>Due: {item.due_date}</Text>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            {(item.status === 'pending' || item.status === 'overdue') && (
              <TouchableOpacity 
                style={styles.payButton} 
                onPress={() => handlePayment(item)}
              >
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: isIOS ? 20 : 16, paddingBottom: 20 }}
      />

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity onPress={closePaymentModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedInvoice && (
              <View style={styles.invoiceSummary}>
                <Text style={styles.invoiceTitle}>{selectedInvoice.title}</Text>
                <Text style={styles.invoiceAmount}>{selectedInvoice.amount_due}</Text>
                <Text style={styles.invoiceDescription}>{selectedInvoice.description}</Text>
              </View>
            )}

            <View style={styles.paymentMethodSection}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentMethodOptions}>
                <TouchableOpacity 
                  style={[styles.paymentMethodOption, paymentMethod === 'card' && styles.selectedOption]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Text style={styles.paymentMethodText}>💳 Credit/Debit Card</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.paymentMethodOption, paymentMethod === 'bank' && styles.selectedOption]}
                  onPress={() => setPaymentMethod('bank')}
                >
                  <Text style={styles.paymentMethodText}>🏦 Bank Transfer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {paymentMethod === 'card' && (
              <View style={styles.cardDetailsSection}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  value={cardDetails.cardNumber}
                  onChangeText={(text) => setCardDetails({...cardDetails, cardNumber: text})}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChangeText={(text) => setCardDetails({...cardDetails, expiryDate: text})}
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChangeText={(text) => setCardDetails({...cardDetails, cvv: text})}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Cardholder Name"
                  value={cardDetails.cardholderName}
                  onChangeText={(text) => setCardDetails({...cardDetails, cardholderName: text})}
                />
              </View>
            )}

            {paymentMethod === 'bank' && (
              <View style={styles.bankDetailsSection}>
                <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankInfoText}>Bank: EduAI University Bank</Text>
                  <Text style={styles.bankInfoText}>Account Number: 123456789012</Text>
                  <Text style={styles.bankInfoText}>IFSC Code: EDUA0001234</Text>
                  <Text style={styles.bankInfoText}>Account Holder: EduAI University</Text>
                  <Text style={styles.bankInfoText}>Reference: {selectedInvoice?.id}</Text>
                </View>
                <Text style={styles.bankNote}>
                  Please include the reference number when making the transfer. Payment will be processed within 2-3 business days.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.payNowButton, processingPayment && styles.disabledButton]} 
              onPress={processPayment}
              disabled={processingPayment}
            >
              <Text style={styles.payNowButtonText}>
                {processingPayment ? 'Processing...' : `Pay ₹${selectedInvoice?.amount_due}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { 
    color: '#1a237e', 
    fontWeight: '800', 
    fontSize: 16,
    flex: 1,
    marginRight: 10
  },
  amount: {
    color: '#1a237e',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  meta: { 
    color: '#6b7280', 
    fontSize: 14,
    marginBottom: 4
  },
  description: {
    color: '#4b5563',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  badge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  badgeText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 11
  },
  payButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  payButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1a237e',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  invoiceSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  invoiceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  invoiceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#1a237e',
    backgroundColor: '#f0f4ff',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  cardDetailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  bankDetailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bankInfo: {
    marginBottom: 12,
  },
  bankInfoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  bankNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payNowButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  payNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ParentFeesScreen;


