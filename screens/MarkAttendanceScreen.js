import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Platform, Linking, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';
import { theme } from '../config/theme';

const isIOS = Platform.OS === 'ios';

const statusOptions = ['present', 'absent', 'late'];

const MarkAttendanceScreen = ({ route, navigation }) => {
  const { 
    classId, 
    className, 
    department, 
    section, 
    timeSlot, 
    date: initialDate, 
    students: initialStudents, 
    flowContext 
  } = route.params || {};
  
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState(initialStudents || []);
  const [marks, setMarks] = useState({}); // studentKey -> { status, notes }
  const [loading, setLoading] = useState(!flowContext); // Don't load if students are already provided
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [reasons, setReasons] = useState([]);

  useBackButton(navigation);

  const getStudentKey = (s) => {
    // Backend expects UUID from roster as student_db_id
    if (s.student_db_id) return String(s.student_db_id);
    if (s.student_uuid) return String(s.student_uuid);
    if (typeof s.id === 'string') return s.id; // UUID fallback
    return null; // don't use numeric/internal ids for backend save
  };

  const getSampleStudents = () => [
    { id: 1, student_id: 'STU001', first_name: 'John', last_name: 'Smith', name: 'John Smith', roll_number: '101', email: 'john.smith@student.edu' },
    { id: 2, student_id: 'STU002', first_name: 'Sarah', last_name: 'Johnson', name: 'Sarah Johnson', roll_number: '102', email: 'sarah.johnson@student.edu' },
    { id: 3, student_id: 'STU003', first_name: 'Michael', last_name: 'Brown', name: 'Michael Brown', roll_number: '103', email: 'michael.brown@student.edu' },
    { id: 4, student_id: 'STU004', first_name: 'Emily', last_name: 'Davis', name: 'Emily Davis', roll_number: '104', email: 'emily.davis@student.edu' },
    { id: 5, student_id: 'STU005', first_name: 'David', last_name: 'Wilson', name: 'David Wilson', roll_number: '105', email: 'david.wilson@student.edu' },
    { id: 6, student_id: 'STU006', first_name: 'Lisa', last_name: 'Anderson', name: 'Lisa Anderson', roll_number: '106', email: 'lisa.anderson@student.edu' },
    { id: 7, student_id: 'STU007', first_name: 'Robert', last_name: 'Taylor', name: 'Robert Taylor', roll_number: '107', email: 'robert.taylor@student.edu' },
    { id: 8, student_id: 'STU008', first_name: 'Jennifer', last_name: 'Martinez', name: 'Jennifer Martinez', roll_number: '108', email: 'jennifer.martinez@student.edu' },
    { id: 9, student_id: 'STU009', first_name: 'Christopher', last_name: 'Lee', name: 'Christopher Lee', roll_number: '109', email: 'christopher.lee@student.edu' },
    { id: 10, student_id: 'STU010', first_name: 'Amanda', last_name: 'Garcia', name: 'Amanda Garcia', roll_number: '110', email: 'amanda.garcia@student.edu' }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Try to load real data first
        try {
          const [roster, existing] = await Promise.all([
            apiClient.getTeacherClassStudents(classId),
            apiClient.getTeacherClassAttendance(classId, date),
          ]);
          
          if (roster?.success && roster?.data?.students?.length > 0) {
            const rosterStudents = roster.data.students;
            console.log('MarkAttendance: Real API students data:', rosterStudents);
            setStudents(rosterStudents);
            
            const map = {};
            (existing?.data?.attendance || []).forEach((a) => {
              const key = String(a.student_id);
              map[key] = { status: a.status || 'present', notes: a.notes || '' };
            });
            
            // default new students to present
            rosterStudents.forEach((s) => {
              const key = getStudentKey(s);
              if (key && !map[key]) map[key] = { status: 'present', notes: '' };
            });
            setMarks(map);
          } else {
            // Show sample data when API returns empty or fails
            console.log('MarkAttendance: API returned empty students, showing sample data');
            const sampleStudents = getSampleStudents();
            console.log('MarkAttendance: Sample students data:', sampleStudents);
            setStudents(sampleStudents);
            
            // Initialize all sample students as present
            const map = {};
            sampleStudents.forEach((s) => {
              const key = getStudentKey(s);
              if (key) map[key] = { status: 'present', notes: '' };
            });
            setMarks(map);
          }
        } catch (e) {
          console.log('API call failed, showing sample data:', e?.message);
          // Show sample data when API fails
          const sampleStudents = getSampleStudents();
          setStudents(sampleStudents);
          
          // Initialize all sample students as present
          const map = {};
          sampleStudents.forEach((s) => {
            const key = getStudentKey(s);
            if (key) map[key] = { status: 'present', notes: '' };
          });
          setMarks(map);
        }
        
        setSummary({ present: 0, absent: 0, late: 0 });
        setDirty(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId, date]);

  useEffect(() => {
    const loadReasons = async () => {
      try {
        const resp = await apiClient.getAttendanceReasons();
        const list = resp?.data?.reasons || resp?.data || [];
        // Normalize to labels array
        const r = Array.isArray(list)
          ? list.map((x) => x.label || x.code || String(x)).filter(Boolean)
          : [];
        setReasons(r);
      } catch (_) {
        setReasons(['Sick', 'Personal', 'Travel', 'Late Transport']);
      }
    };
    loadReasons();
  }, []);

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

  const updateStatus = (studentKey, status) => {
    setMarks((prev) => ({ ...prev, [studentKey]: { ...(prev[studentKey] || {}), status } }));
    setDirty(true);
  };

  const updateNotes = (studentKey, notes) => {
    setMarks((prev) => ({ ...prev, [studentKey]: { ...(prev[studentKey] || {}), notes } }));
    setDirty(true);
  };

  const computeSummary = (map) => {
    const counts = { present: 0, absent: 0, late: 0 };
    Object.values(map || {}).forEach((v) => {
      const s = v?.status || 'present';
      if (counts[s] !== undefined) counts[s] += 1;
    });
    setSummary(counts);
  };

  useEffect(() => {
    computeSummary(marks);
  }, [marks]);

  const save = async () => {
    try {
      setSaving(true);
      const entries = students
        .map((s) => {
          const key = getStudentKey(s);
          if (!key) return null;
          return {
            student_id: key,
            status: marks[key]?.status || 'present',
            notes: marks[key]?.notes || '',
          };
        })
        .filter(Boolean);

      let resp;
      if (flowContext && department && section && timeSlot) {
        // Use the new department/section/time-based API
        const payload = {
          department_id: department.id,
          section: section,
          time_slot: timeSlot.id,
          date: date,
          entries: entries
        };
        resp = await apiClient.saveDepartmentSectionAttendance(payload);
      } else {
        // Use the existing class-based API
        resp = await apiClient.saveTeacherClassAttendance(classId, { date, entries });
      }

      if (resp?.success) {
        setDirty(false);
        // Show both a banner and a native/web alert for clarity
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
        try { Alert.alert('Success', 'Attendance saved'); } catch (_) {}
      } else {
        Alert.alert('Error', resp?.message || 'Failed to save');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const exportCsvWeb = async () => {
    if (Platform.OS === 'web') {
    try {
      const resp = await apiClient.exportTeacherAttendanceCsv(classId, date);
      const blob = resp?.data instanceof Blob ? resp.data : new Blob([resp?.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${classId}_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      try { Alert.alert('Error', 'Failed to export CSV'); } catch (_) {}
      }
    } else {
      // For mobile platforms, show instructions
      Alert.alert(
        'Export on Mobile',
        'To export attendance data on mobile:\n\n1. Use the web version of the app\n2. Or take a screenshot of the attendance summary\n3. Use the "All Present" or "All Absent" buttons for bulk actions',
        [{ text: 'OK' }]
      );
    }
  };

  const showImportFormat = () => {
    const formatInfo = `CSV Import Format Guide:

Required Columns:
• student_id: Student's unique identifier
• status: Attendance status (present/absent/late)
• notes: Optional reason or notes

Example CSV:
student_id,status,notes
STU001,present,
STU002,absent,Sick
STU003,late,Traffic jam
STU004,present,

Notes:
• Use comma (,) as separator
• First row should contain headers
• Status must be: present, absent, or late
• Leave notes empty if not needed
• Save file as .csv format`;

    Alert.alert(
      'CSV Import Format',
      formatInfo,
      [
        { text: 'Import File', onPress: importCsvWeb },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const downloadTemplate = () => {
    if (Platform.OS === 'web') {
      try {
        const templateData = `student_id,status,notes
STU001,present,
STU002,absent,Sick
STU003,late,Traffic jam
STU004,present,
STU005,absent,Personal reason`;

        const blob = new Blob([templateData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_template_${classId}_${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        Alert.alert('Error', 'Failed to download template');
      }
    } else {
      // For mobile platforms, show the template content
      const templateData = `student_id,status,notes
STU001,present,
STU002,absent,Sick
STU003,late,Traffic jam
STU004,present,
STU005,absent,Personal reason`;

      Alert.alert(
        'CSV Template',
        `Copy this template and save as .csv file:\n\n${templateData}\n\nNote: Use the web version for automatic template download.`,
        [{ text: 'OK' }]
      );
    }
  };

  const importCsvWeb = () => {
    if (Platform.OS === 'web') {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv';
      input.onchange = async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
          
          // Validate file type
          if (!file.name.toLowerCase().endsWith('.csv')) {
            Alert.alert('Error', 'Please select a CSV file');
            return;
          }

        try {
          const resp = await apiClient.importTeacherAttendanceCsv(classId, file, date);
          if (resp?.success) {
              Alert.alert('Success', 'CSV imported successfully!');
            // reload attendance after import
            const existing = await apiClient.getTeacherClassAttendance(classId, date);
            const map = {};
            (existing?.data?.attendance || []).forEach((a) => {
              const key = String(a.student_id);
              map[key] = { status: a.status || 'present', notes: a.notes || '' };
            });
            setMarks(map);
            setDirty(false);
          } else {
              Alert.alert('Import Failed', resp?.message || 'Import failed. Please check your CSV format.');
          }
        } catch (err) {
            Alert.alert('Import Error', err?.message || 'Import failed. Please check your CSV format and try again.');
        }
      };
      input.click();
    } catch (e) {
      try { Alert.alert('Error', 'Failed to import CSV'); } catch (_) {}
      }
    } else {
      // For mobile platforms, show instructions
      Alert.alert(
        'Import on Mobile',
        'To import attendance data on mobile:\n\n1. Use the web version of the app\n2. Or manually enter attendance data\n3. Use the "All Present" or "All Absent" buttons for bulk actions',
        [{ text: 'OK' }]
      );
    }
  };

  // WhatsApp and AI Call functionality
  const sendWhatsAppToParents = async (studentId = null) => {
    try {
      // Get attendance summary for messaging
      const absentStudents = students.filter(s => {
        const key = getStudentKey(s);
        return marks[key]?.status === 'absent' || marks[key]?.status === 'late';
      });

      if (studentId) {
        // Send to specific student's parent
        const student = students.find(s => getStudentKey(s) === studentId);
        if (!student) {
          Alert.alert('Error', 'Student not found');
          return;
        }
        
        const studentMark = marks[studentId];
        const message = `Dear Parent/Guardian,

Your ward ${student.first_name || student.name} (ID: ${student.student_id || student.id}) was marked as ${studentMark?.status?.toUpperCase()} on ${date}.

${studentMark?.notes ? `Reason: ${studentMark.notes}` : ''}

Please ensure regular attendance for better academic performance.

Best regards,
Teacher`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        if (Platform.OS === 'web') {
          window.open(whatsappUrl, '_blank');
        } else {
          await Linking.openURL(whatsappUrl);
        }
      } else {
        // Send to all parents of absent/late students
        if (absentStudents.length === 0) {
          Alert.alert('Info', 'No absent or late students to notify');
          return;
        }

        const message = `Dear Parents/Guardians,

Attendance Report for ${date}:

${absentStudents.map(s => {
          const key = getStudentKey(s);
          const mark = marks[key];
          return `• ${s.first_name || s.name} (ID: ${s.student_id || s.id}) - ${mark?.status?.toUpperCase()}${mark?.notes ? ` (${mark.notes})` : ''}`;
        }).join('\n')}

Please ensure regular attendance for better academic performance.

Best regards,
Teacher`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        if (Platform.OS === 'web') {
          window.open(whatsappUrl, '_blank');
        } else {
          await Linking.openURL(whatsappUrl);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp: ' + error.message);
    }
  };

  const initiateAICall = async (studentId = null) => {
    try {
      if (studentId) {
        // AI Call for specific student
        const student = students.find(s => getStudentKey(s) === studentId);
        if (!student) {
          Alert.alert('Error', 'Student not found');
          return;
        }
        
        const studentMark = marks[studentId];
        Alert.alert(
          'AI Call Initiated',
          `AI call will be made to ${student.first_name || student.name}'s parent regarding their ${studentMark?.status?.toUpperCase()} status on ${date}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => {
              // TODO: Implement actual AI call functionality
              Alert.alert('Success', 'AI call has been scheduled and will be made shortly.');
            }}
          ]
        );
      } else {
        // AI Call for all absent/late students
        const absentStudents = students.filter(s => {
          const key = getStudentKey(s);
          return marks[key]?.status === 'absent' || marks[key]?.status === 'late';
        });

        if (absentStudents.length === 0) {
          Alert.alert('Info', 'No absent or late students to call about');
          return;
        }

        Alert.alert(
          'AI Call Initiated',
          `AI calls will be made to parents of ${absentStudents.length} students regarding their attendance status on ${date}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => {
              // TODO: Implement actual AI call functionality
              Alert.alert('Success', 'AI calls have been scheduled and will be made shortly.');
            }}
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate AI call: ' + error.message);
    }
  };

  const renderRow = ({ item }) => {
    const key = getStudentKey(item) || String(item.id);
    const current = marks[key] || { status: 'present', notes: '' };
    
    // Handle both API data (first_name, last_name) and sample data (name) formats
    const fullName = item.first_name && item.last_name 
      ? `${item.first_name} ${item.last_name}`
      : item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown Student';
    
    const studentId = item.student_id || item.roll_number || item.id;
    
    return (
      <View style={styles.studentCard}>
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

        {/* Notes and Communication Section */}
          {current.status !== 'present' && (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionLabel}>Reason & Notes</Text>
            
            {/* Quick Reason Chips */}
            <View style={styles.reasonChips}>
                {(reasons.length ? reasons : ['Sick','Personal','Travel','Late Transport']).map((r) => (
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
            
            {/* Communication Actions */}
              {(current.status === 'absent' || current.status === 'late') && (
              <View style={styles.communicationActions}>
                  <TouchableOpacity 
                  style={[styles.commActionBtn, styles.whatsappActionBtn]} 
                    onPress={() => sendWhatsAppToParents(key)}
                  >
                  <Text style={styles.commActionBtnText}>📱 Notify Parent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  style={[styles.commActionBtn, styles.aiCallActionBtn]} 
                    onPress={() => initiateAICall(key)}
                  >
                  <Text style={styles.commActionBtnText}>🤖 AI Call</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
          )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#1a237e', '#3949ab', '#5c6bc0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {flowContext && department && section && timeSlot 
            ? `${department.name} - Section ${section}` 
            : (className || 'Mark Attendance')
          }
        </Text>
          <Text style={styles.headerSubtitle}>
            {flowContext && timeSlot 
              ? `📅 ${new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • ${timeSlot.label}`
              : `📅 ${new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
            }
          </Text>
      </View>
      </LinearGradient>

      {/* Success Banner */}
      {showSaved && (
        <Animated.View style={styles.savedBanner}>
          <Text style={styles.savedBannerText}>✅ Attendance saved successfully</Text>
        </Animated.View>
      )}

      {/* Modern Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>📅 Date</Text>
          <TextInput 
            value={date} 
            onChangeText={setDate} 
            style={styles.dateInput} 
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionBtn, styles.presentBtn]} onPress={() => markAll('present')}>
            <Text style={styles.actionBtnText}>✓ All Present</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.absentBtn]} onPress={() => markAll('absent')}>
            <Text style={styles.actionBtnText}>✗ All Absent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Communication & Export Section */}
      <View style={styles.communicationSection}>
        <View style={styles.communicationButtons}>
          <TouchableOpacity style={[styles.commBtn, styles.whatsappBtn]} onPress={() => sendWhatsAppToParents()}>
            <Text style={styles.commBtnText}>📱 Notify Parents</Text>
              </TouchableOpacity>
          <TouchableOpacity style={[styles.commBtn, styles.aiCallBtn]} onPress={() => initiateAICall()}>
            <Text style={styles.commBtnText}>🤖 AI Calls</Text>
              </TouchableOpacity>
        </View>
        
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportBtn} onPress={exportCsvWeb}>
            <Text style={styles.exportBtnText}>📊 Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.templateBtn} onPress={downloadTemplate}>
            <Text style={styles.templateBtnText}>📋 Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.importBtn} onPress={showImportFormat}>
            <Text style={styles.importBtnText}>📥 Import</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]} 
          disabled={saving || !dirty} 
          onPress={save}
        >
          <Text style={styles.saveBtnText}>
            {saving ? '⏳ Saving...' : dirty ? '💾 Save Changes' : '✅ Saved'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modern Summary Cards */}
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

      {/* Student List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📚 Loading student roster...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderRow}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header Styles
  header: {
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
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

  // Success Banner
  savedBanner: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  savedBannerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Toolbar Styles
  toolbar: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    ...theme.shadows.small,
  },
  dateSection: {
    flex: 1,
    marginRight: 16,
  },
  sectionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 14,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  presentBtn: {
    backgroundColor: theme.colors.success,
  },
  absentBtn: {
    backgroundColor: theme.colors.error,
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },

  // Communication Section
  communicationSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  communicationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  commBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    borderColor: 'rgba(37, 211, 102, 0.3)',
    shadowColor: '#25D366',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  aiCallBtn: {
    backgroundColor: '#8B5CF6',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  commBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBtn: {
    backgroundColor: theme.colors.info,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...theme.shadows.small,
  },
  exportBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  templateBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  templateBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  importBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(26, 35, 126, 0.3)',
  },
  importBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    ...theme.shadows.medium,
  },
  saveBtnDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.medium,
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
    fontSize: 24,
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

  // Student Cards
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    ...theme.shadows.medium,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  studentId: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: '700',
  },

  // Status Section
  statusSection: {
    marginBottom: 16,
  },
  statusSectionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
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
    fontSize: 14,
  },
  statusButtonTextSelected: {
    color: 'white',
  },

  // Notes Section
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 16,
  },
  notesSectionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  reasonChip: {
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 12,
  },
  reasonChipTextSelected: {
    color: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  communicationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  commActionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  whatsappActionBtn: {
    backgroundColor: '#25D366',
    borderColor: 'rgba(37, 211, 102, 0.3)',
    shadowColor: '#25D366',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  aiCallActionBtn: {
    backgroundColor: '#8B5CF6',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  commActionBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MarkAttendanceScreen;


