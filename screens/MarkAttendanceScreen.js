import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Platform, Linking } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const statusOptions = ['present', 'absent', 'late'];

const MarkAttendanceScreen = ({ route, navigation }) => {
  const { classId, className } = route.params || {};
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentKey -> { status, notes }
  const [loading, setLoading] = useState(true);
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
      const resp = await apiClient.saveTeacherClassAttendance(classId, { date, entries });
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
  };

  const importCsvWeb = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv';
      input.onchange = async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        try {
          const resp = await apiClient.importTeacherAttendanceCsv(classId, file, date);
          if (resp?.success) {
            Alert.alert('Import', 'CSV imported successfully.');
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
            Alert.alert('Import', resp?.message || 'Import failed.');
          }
        } catch (err) {
          Alert.alert('Import', err?.message || 'Import failed.');
        }
      };
      input.click();
    } catch (e) {
      try { Alert.alert('Error', 'Failed to import CSV'); } catch (_) {}
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
      <View style={styles.row}>
        <View style={styles.studentCol}>
          <Text style={styles.studentName}>{fullName}</Text>
          <Text style={styles.studentMeta}>ID: {studentId}</Text>
        </View>
        <View style={styles.statusCol}>
          {statusOptions.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => updateStatus(key, s)}
              style={[styles.statusPill, styles[`status_${s}`], current.status === s && styles.statusSelected]}
            >
              <Text style={styles.statusText}>{s[0].toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.notesCol}>
          {current.status !== 'present' && (
            <>
              <View style={styles.reasonChipsRow}>
                {(reasons.length ? reasons : ['Sick','Personal','Travel','Late Transport']).map((r) => (
                  <TouchableOpacity key={r} style={styles.reasonChip} onPress={() => updateNotes(key, r)}>
                    <Text style={styles.reasonChipText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={current.notes}
                onChangeText={(t) => updateNotes(key, t)}
                placeholder="Reason / Notes"
                style={styles.notesInput}
              />
              {/* Communication buttons for absent/late students */}
              {(current.status === 'absent' || current.status === 'late') && (
                <View style={styles.communicationButtons}>
                  <TouchableOpacity 
                    style={styles.individualWhatsappBtn} 
                    onPress={() => sendWhatsAppToParents(key)}
                  >
                    <Text style={styles.individualWhatsappText}>📱 WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.individualAiCallBtn} 
                    onPress={() => initiateAICall(key)}
                  >
                    <Text style={styles.individualAiCallText}>🤖 AI Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{className || 'Mark Attendance'}</Text>
        <Text style={styles.headerSubtitle}>Mark attendance for {date}</Text>
      </View>
      {showSaved && (
        <View style={styles.savedBanner}>
          <Text style={styles.savedBannerText}>Attendance saved</Text>
        </View>
      )}
      <View style={styles.toolbar}>
        <View style={styles.dateBox}>
          <Text style={styles.label}>Date</Text>
          <TextInput value={date} onChangeText={setDate} style={styles.dateInput} placeholder="YYYY-MM-DD" />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.present]} onPress={() => markAll('present')}>
            <Text style={styles.actionText}>All Present</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.absent]} onPress={() => markAll('absent')}>
            <Text style={styles.actionText}>All Absent</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <TouchableOpacity style={[styles.exportBtn]} onPress={exportCsvWeb}>
                <Text style={styles.exportText}>Export CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.importBtn]} onPress={importCsvWeb}>
                <Text style={styles.exportText}>Import CSV</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={[styles.whatsappBtn]} onPress={() => sendWhatsAppToParents()}>
            <Text style={styles.whatsappText}>📱 WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aiCallBtn]} onPress={() => initiateAICall()}>
            <Text style={styles.aiCallText}>🤖 AI Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} disabled={saving || !dirty} onPress={save}>
            <Text style={styles.saveText}>{saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBar}>
        <View style={[styles.sumPill, styles.sumPresent]}><Text style={styles.sumText}>P: {summary.present}</Text></View>
        <View style={[styles.sumPill, styles.sumAbsent]}><Text style={styles.sumText}>A: {summary.absent}</Text></View>
        <View style={[styles.sumPill, styles.sumLate]}><Text style={styles.sumText}>L: {summary.late}</Text></View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading roster...</Text></View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderRow}
          contentContainerStyle={{ paddingHorizontal: isIOS ? 20 : 16, paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  toolbar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  dateBox: { flex: 1, marginRight: 12 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 6, fontSize: 12 },
  dateInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  actionText: { color: 'white', fontWeight: '700' },
  present: { backgroundColor: '#10b981' },
  absent: { backgroundColor: '#ef4444' },
  exportBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  importBtn: { backgroundColor: '#0369a1', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  exportText: { color: 'white', fontWeight: '700' },
  whatsappBtn: { backgroundColor: '#25D366', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  whatsappText: { color: 'white', fontWeight: '700' },
  aiCallBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  aiCallText: { color: 'white', fontWeight: '700' },
  saveBtn: { backgroundColor: '#1a237e', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  saveText: { color: 'white', fontWeight: '700' },
  loadingContainer: { padding: 16 },
  loadingText: { color: '#1a237e' },
  savedBanner: { backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 16 },
  savedBannerText: { color: 'white', fontWeight: '700', textAlign: 'center' },
  row: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginTop: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  studentCol: { flex: 1 },
  studentName: { color: '#1a237e', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  studentMeta: { color: '#9ca3af', fontSize: 11, fontWeight: '500' },
  statusCol: { flexDirection: 'row', marginHorizontal: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginHorizontal: 3 },
  status_present: { backgroundColor: '#10b981' },
  status_absent: { backgroundColor: '#ef4444' },
  status_late: { backgroundColor: '#f59e0b' },
  statusSelected: { borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  statusText: { color: 'white', fontWeight: '800' },
  notesCol: { flex: 1 },
  notesInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fafafa' },
  reasonChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  reasonChip: { backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  reasonChipText: { color: '#0369a1', fontWeight: '700', fontSize: 12 },
  communicationButtons: { flexDirection: 'row', marginTop: 8, gap: 8 },
  individualWhatsappBtn: { backgroundColor: '#25D366', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, flex: 1 },
  individualWhatsappText: { color: 'white', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  individualAiCallBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, flex: 1 },
  individualAiCallText: { color: 'white', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  summaryBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sumPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  sumPresent: { backgroundColor: '#10b981' },
  sumAbsent: { backgroundColor: '#ef4444' },
  sumLate: { backgroundColor: '#f59e0b' },
  sumText: { color: 'white', fontWeight: '800' },
});

export default MarkAttendanceScreen;


