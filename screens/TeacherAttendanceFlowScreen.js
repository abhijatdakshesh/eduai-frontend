import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const TeacherAttendanceFlowScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Selection states
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Loading states
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Attendance marking states
  const [marks, setMarks] = useState({}); // studentKey -> { status, notes }
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [reasons, setReasons] = useState([]);

  useBackButton(navigation);

  // Status options for attendance
  const statusOptions = ['present', 'absent', 'late'];

  // Get student key for attendance tracking
  const getStudentKey = (s) => {
    if (s.student_db_id) return String(s.student_db_id);
    if (s.student_uuid) return String(s.student_uuid);
    if (typeof s.id === 'string') return s.id;
    return String(s.id);
  };

  // Update attendance status
  const updateStatus = (studentKey, status) => {
    setMarks((prev) => ({ ...prev, [studentKey]: { ...(prev[studentKey] || {}), status } }));
    setDirty(true);
  };

  // Update attendance notes
  const updateNotes = (studentKey, notes) => {
    setMarks((prev) => ({ ...prev, [studentKey]: { ...(prev[studentKey] || {}), notes } }));
    setDirty(true);
  };

  // Compute attendance summary
  const computeSummary = (map) => {
    const counts = { present: 0, absent: 0, late: 0 };
    Object.values(map || {}).forEach((v) => {
      const s = v?.status || 'present';
      if (counts[s] !== undefined) counts[s] += 1;
    });
    setSummary(counts);
  };

  // Mark all students with same status
  const markAll = (status) => {
    const next = {};
    students.forEach((s) => {
      const key = getStudentKey(s);
      if (!key) return;
      next[key] = { status, notes: marks[key]?.notes || '' };
    });
    setMarks(next);
    setDirty(true);
  };

  // Save attendance
  const saveAttendance = async () => {
    try {
      setSaving(true);
      // Resolve classId from selected section when possible
      let classId = null;
      const sectionObj = (sections || []).find((sec) => {
        if (typeof sec === 'string') return sec === selectedSection;
        const name = sec?.name || sec?.section || sec?.title;
        return name === selectedSection;
      });
      if (sectionObj && typeof sectionObj === 'object' && sectionObj.id) {
        classId = sectionObj.id;
      }
      const entries = students
        .map((s) => {
          const key = getStudentKey(s);
          if (!key) return null;
          return {
            student_id: key,
            studentId: key,
            status: marks[key]?.status || 'present',
            notes: marks[key]?.notes || '',
          };
        })
        .filter(Boolean);

      const payload = {
        department_id: selectedDepartment.id,
        section: selectedSection,
        time_slot: selectedTimeSlot.id,
        date: selectedDate,
        classId: classId || undefined,
        entries: entries
      };
      
      const resp = await apiClient.saveDepartmentSectionAttendance(payload);
      if (resp?.success) {
        setDirty(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
        Alert.alert('Success', 'Attendance saved successfully!');
      } else {
        Alert.alert('Error', resp?.message || 'Failed to save attendance');
      }
    } catch (e) {
      if (e?.validation && Array.isArray(e.validation) && e.validation.length > 0) {
        Alert.alert('Validation error', e.validation.map(v => `• ${v}`).join('\n'));
      } else {
        Alert.alert('Error', e?.message || 'Failed to save attendance');
      }
    } finally {
      setSaving(false);
    }
  };

  // Generate time slots (9 AM to 5 PM, 1-hour intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        id: `${startTime}-${endTime}`,
        label: `${startTime} - ${endTime}`,
        startTime,
        endTime
      });
    }
    return slots;
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
    fetchDepartments();
    setReasons(['Sick', 'Personal', 'Travel', 'Late Transport']);
  }, []);

  useEffect(() => {
    computeSummary(marks);
  }, [marks]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchSections();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await apiClient.getCourseDepartments();
      
      if (response?.success && response?.data?.length > 0) {
        // Handle both array of strings and array of objects
        const departmentsData = response.data;
        if (typeof departmentsData[0] === 'object' && departmentsData[0].name) {
          setDepartments(departmentsData);
        } else {
          const departmentObjects = departmentsData.map((name, index) => ({ 
            id: index + 1, 
            name 
          }));
          setDepartments(departmentObjects);
        }
      } else {
        // Fallback departments
        setDepartments([
          { id: 1, name: 'Computer Science' },
          { id: 2, name: 'Information Science' },
          { id: 3, name: 'Electronics' },
          { id: 4, name: 'Mechanical' },
          { id: 5, name: 'Civil' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use fallback departments
      setDepartments([
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'Information Science' },
        { id: 3, name: 'Electronics' },
        { id: 4, name: 'Mechanical' },
        { id: 5, name: 'Civil' }
      ]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedDepartment) return;
    
    try {
      setLoadingSections(true);
      // Try to fetch sections from API first
      try {
        const response = await apiClient.getSectionsByDepartment(selectedDepartment.id);
        if (response?.success && response?.data?.sections?.length > 0) {
          setSections(response.data.sections);
        } else {
          // Fallback to predefined sections
          setSections(['A', 'B', 'C', 'D']);
        }
      } catch (apiError) {
        console.log('API call failed, using fallback sections:', apiError?.message);
        // Fallback to predefined sections
        setSections(['A', 'B', 'C', 'D']);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections(['A', 'B', 'C', 'D']); // Fallback
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedDepartment || !selectedSection || !selectedTimeSlot) return;
    
    try {
      setLoadingStudents(true);
      // Try to fetch students from API first
      try {
        const response = await apiClient.getStudentsByDepartmentSectionTime(
          selectedDepartment.id,
          selectedSection,
          selectedTimeSlot.id,
          selectedDate
        );
        if (response?.success && response?.data?.students?.length > 0) {
          setStudents(response.data.students);
          // Initialize marks for all students as present
          const initialMarks = {};
          response.data.students.forEach((s) => {
            const key = getStudentKey(s);
            if (key) initialMarks[key] = { status: 'present', notes: '' };
          });
          setMarks(initialMarks);
        } else {
          // Fallback to sample data
          const sampleStudents = [
            { id: 1, student_id: 'STU001', first_name: 'John', last_name: 'Smith', roll_number: '101' },
            { id: 2, student_id: 'STU002', first_name: 'Sarah', last_name: 'Johnson', roll_number: '102' },
            { id: 3, student_id: 'STU003', first_name: 'Michael', last_name: 'Brown', roll_number: '103' },
            { id: 4, student_id: 'STU004', first_name: 'Emily', last_name: 'Davis', roll_number: '104' },
            { id: 5, student_id: 'STU005', first_name: 'David', last_name: 'Wilson', roll_number: '105' }
          ];
          setStudents(sampleStudents);
          // Initialize marks for sample students
          const initialMarks = {};
          sampleStudents.forEach((s) => {
            const key = getStudentKey(s);
            if (key) initialMarks[key] = { status: 'present', notes: '' };
          });
          setMarks(initialMarks);
        }
      } catch (apiError) {
        console.log('API call failed, using sample data:', apiError?.message);
        // Fallback to sample data
        const sampleStudents = [
          { id: 1, student_id: 'STU001', first_name: 'John', last_name: 'Smith', roll_number: '101' },
          { id: 2, student_id: 'STU002', first_name: 'Sarah', last_name: 'Johnson', roll_number: '102' },
          { id: 3, student_id: 'STU003', first_name: 'Michael', last_name: 'Brown', roll_number: '103' },
          { id: 4, student_id: 'STU004', first_name: 'Emily', last_name: 'Davis', roll_number: '104' },
          { id: 5, student_id: 'STU005', first_name: 'David', last_name: 'Wilson', roll_number: '105' }
        ];
        setStudents(sampleStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students for this section');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedDepartment) {
      Alert.alert('Selection Required', 'Please select a department');
      return;
    }
    if (currentStep === 2 && !selectedSection) {
      Alert.alert('Selection Required', 'Please select a section');
      return;
    }
    if (currentStep === 3 && !selectedTimeSlot) {
      Alert.alert('Selection Required', 'Please select a time slot');
      return;
    }
    
    if (currentStep === 3) {
      // Fetch students when moving to step 4
      fetchStudents();
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToAttendance = () => {
    if (students.length === 0) {
      Alert.alert('No Students', 'No students found for the selected criteria');
      return;
    }
    
    // Navigate to the existing MarkAttendanceScreen with the flow context
    navigation.navigate('MarkAttendance', {
      classId: `${selectedDepartment.id}_${selectedSection}_${selectedTimeSlot.id}`,
      className: `${selectedDepartment.name} - Section ${selectedSection} (${selectedTimeSlot.label})`,
      department: selectedDepartment,
      section: selectedSection,
      timeSlot: selectedTimeSlot,
      date: selectedDate,
      students: students,
      flowContext: true
    });
  };

  const renderStudentCard = (student) => {
    const key = getStudentKey(student);
    const current = marks[key] || { status: 'present', notes: '' };
    
    const fullName = student.first_name && student.last_name 
      ? `${student.first_name} ${student.last_name}`
      : student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';
    
    const studentId = student.student_id || student.roll_number || student.id;
    
    return (
      <View key={student.id} style={styles.studentCard}>
        {/* Student Info Header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{fullName}</Text>
            <Text style={styles.studentId}>ID: {studentId}</Text>
          </View>
          <View style={[styles.statusIndicator, styles[`statusIndicator_${current.status}`]]}>
            <Text style={styles.statusIndicatorText}>
              {current.status === 'present' ? '✓' : current.status === 'absent' ? '✗' : '⏰'}
            </Text>
          </View>
        </View>

        {/* Status Selection */}
        <View style={styles.statusSection}>
          <Text style={styles.statusSectionLabel}>Attendance Status</Text>
          <View style={styles.statusButtons}>
            {statusOptions.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => updateStatus(key, s)}
                style={[
                  styles.statusButton, 
                  styles[`statusButton_${s}`], 
                  current.status === s && styles.statusButtonSelected
                ]}
              >
                <Text style={[
                  styles.statusButtonText,
                  current.status === s && styles.statusButtonTextSelected
                ]}>
                  {s === 'present' ? '✓ Present' : s === 'absent' ? '✗ Absent' : '⏰ Late'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Section */}
        {current.status !== 'present' && (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionLabel}>Reason & Notes</Text>
            
            {/* Quick Reason Chips */}
            <View style={styles.reasonChips}>
              {reasons.map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[
                    styles.reasonChip, 
                    current.notes === r && styles.reasonChipSelected
                  ]} 
                  onPress={() => updateNotes(key, r)}
                >
                  <Text style={[
                    styles.reasonChipText,
                    current.notes === r && styles.reasonChipTextSelected
                  ]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Notes Input */}
            <TextInput
              value={current.notes}
              onChangeText={(t) => updateNotes(key, t)}
              placeholder="Add custom reason or notes..."
              placeholderTextColor={theme.colors.placeholder}
              style={styles.notesInput}
              multiline
            />
          </View>
        )}
      </View>
    );
  };

  const renderStepIndicator = () => {
    const steps = ['Department', 'Section', 'Time', 'Students'];
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              index + 1 <= currentStep && styles.stepCircleActive
            ]}>
              <Text style={[
                styles.stepNumber,
                index + 1 <= currentStep && styles.stepNumberActive
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              index + 1 <= currentStep && styles.stepLabelActive
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDepartmentSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Department</Text>
      <Text style={styles.stepDescription}>
        Choose the department for which you want to mark attendance
      </Text>
      
      {loadingDepartments ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading departments...</Text>
        </View>
      ) : (
        <View style={styles.selectionContainer}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept.id}
              style={[
                styles.selectionCard,
                selectedDepartment?.id === dept.id && styles.selectionCardSelected
              ]}
              onPress={() => setSelectedDepartment(dept)}
            >
              <Text style={[
                styles.selectionCardText,
                selectedDepartment?.id === dept.id && styles.selectionCardTextSelected
              ]}>
                {dept.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderSectionSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Section</Text>
      <Text style={styles.stepDescription}>
        Choose the section (A, B, C, D) for {selectedDepartment?.name}
      </Text>
      
      {loadingSections ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading sections...</Text>
        </View>
      ) : (
        <View style={styles.selectionContainer}>
          {sections.map((sectionItem) => {
            const sectionName = typeof sectionItem === 'string' 
              ? sectionItem 
              : (sectionItem?.name || sectionItem?.section || sectionItem?.title || '');
            const sectionKey = typeof sectionItem === 'string' 
              ? sectionItem 
              : (String(sectionItem?.id || sectionItem?.name || sectionName));

            return (
              <TouchableOpacity
                key={sectionKey}
                style={[
                  styles.selectionCard,
                  selectedSection === sectionName && styles.selectionCardSelected
                ]}
                onPress={() => setSelectedSection(sectionName)}
              >
                <Text style={[
                  styles.selectionCardText,
                  selectedSection === sectionName && styles.selectionCardTextSelected
                ]}>
                  Section {sectionName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderTimeSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Time Slot</Text>
      <Text style={styles.stepDescription}>
        Choose the 1-hour time slot for the class
      </Text>
      
      <View style={styles.selectionContainer}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.selectionCard,
              selectedTimeSlot?.id === slot.id && styles.selectionCardSelected
            ]}
            onPress={() => setSelectedTimeSlot(slot)}
          >
            <Text style={[
              styles.selectionCardText,
              selectedTimeSlot?.id === slot.id && styles.selectionCardTextSelected
            ]}>
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStudentList = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Mark Attendance</Text>
      <Text style={styles.stepDescription}>
        {selectedDepartment?.name} - Section {selectedSection} ({selectedTimeSlot?.label})
      </Text>
      
      {loadingStudents ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : (
        <View style={styles.attendanceContainer}>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.presentCard]}>
              <Text style={styles.summaryNumber}>{summary.present}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={[styles.summaryCard, styles.absentCard]}>
              <Text style={styles.summaryNumber}>{summary.absent}</Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={[styles.summaryCard, styles.lateCard]}>
              <Text style={styles.summaryNumber}>{summary.late}</Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
          </View>

          {/* Student List with Attendance Marking */}
          <View style={styles.studentListContainer}>
            {students.map((student) => {
              const key = getStudentKey(student) || String(student?.id || student?.student_id || Math.random());
              return (
                <React.Fragment key={key}>
                  {renderStudentCard(student)}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderDepartmentSelection();
      case 2:
        return renderSectionSelection();
      case 3:
        return renderTimeSelection();
      case 4:
        return renderStudentList();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1a237e', '#3949ab', '#5c6bc0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>Step-by-step attendance marking</Text>
      </LinearGradient>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          {currentStep < 4 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.attendanceActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.markAllButton]} 
                onPress={() => markAll('present')}
              >
                <Text style={styles.actionButtonText}>✓ All Present</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.markAllButton]} 
                onPress={() => markAll('absent')}
              >
                <Text style={styles.actionButtonText}>✗ All Absent</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.nextButton, (!dirty || saving) && styles.nextButtonDisabled]} 
                onPress={saveAttendance}
                disabled={saving || !dirty}
              >
                <Text style={styles.nextButtonText}>
                  {saving ? '⏳ Saving...' : dirty ? '💾 Save Attendance' : '✅ Saved'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: isIOS ? 16 : 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepNumber: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  selectionContainer: {
    gap: 12,
  },
  selectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    ...theme.shadows.small,
  },
  selectionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
  },
  selectionCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  selectionCardTextSelected: {
    color: theme.colors.primary,
  },
  studentListContainer: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    ...theme.shadows.small,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  navigationContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
  
  // Attendance marking styles
  attendanceContainer: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    ...theme.shadows.small,
  },
  presentCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  absentCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  lateCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Student card styles
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    ...theme.shadows.small,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  studentId: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator_present: {
    backgroundColor: theme.colors.success,
  },
  statusIndicator_absent: {
    backgroundColor: theme.colors.error,
  },
  statusIndicator_late: {
    backgroundColor: theme.colors.warning,
  },
  statusIndicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Status section styles
  statusSection: {
    marginBottom: 12,
  },
  statusSectionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  statusButton_present: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: theme.colors.success,
  },
  statusButton_absent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.colors.error,
  },
  statusButton_late: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: theme.colors.warning,
  },
  statusButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  statusButtonTextSelected: {
    color: 'white',
  },
  
  // Notes section styles
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 12,
  },
  notesSectionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  reasonChip: {
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  reasonChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reasonChipText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  reasonChipTextSelected: {
    color: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  
  // Action buttons styles
  attendanceActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  markAllButton: {
    backgroundColor: theme.colors.inputBackground,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default TeacherAttendanceFlowScreen;
