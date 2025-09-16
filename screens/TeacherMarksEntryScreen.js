import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { assessmentsAPI } from '../services/apiService';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');

const initialTestState = {
  name: '',
  date: new Date().toISOString().slice(0, 10),
  maxMarks: 100,
  weightage: 0,
  term: 'T1',
  subjectId: '',
  examinationType: 'internal',
  notes: '',
};

export default function TeacherMarksEntryScreen() {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [test, setTest] = useState(initialTestState);
  const [assessmentId, setAssessmentId] = useState(null);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await apiClient.getTeacherClasses?.();
        if (res?.success) {
          setClasses(res.data?.classes || []);
        }
      } catch {}
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      if (!classId) return;
      try {
        const res = await apiClient.getTeacherClassSubjects(classId);
        if (res?.success) {
          setSubjects(res.data?.subjects || []);
        } else {
          setSubjects([]);
        }
      } catch {
        setSubjects([]);
      }
    };
    loadSubjects();
  }, [classId]);

  const canCreate = useMemo(() => classId && subjectId && test.name && test.maxMarks > 0, [classId, subjectId, test]);
  const canSaveMarks = useMemo(() => assessmentId && Object.keys(marksMap).length > 0, [assessmentId, marksMap]);

  const handleFetchRoster = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getClassStudents(classId);
      if (res?.success) {
        const list = res.data?.students || res.data || [];
        setStudents(Array.isArray(list) ? list : []);
      } else {
        setStudents([]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const validateTest = () => {
    const next = {};
    if (!classId) next.classId = 'Class/Section is required';
    if (!subjectId) next.subjectId = 'Subject is required';
    if (!test.name) next.name = 'Test name is required';
    if (!test.date || !/^\d{4}-\d{2}-\d{2}$/.test(test.date)) next.date = 'Date must be YYYY-MM-DD';
    if (!(Number(test.maxMarks) > 0)) next.maxMarks = 'Max marks must be > 0';
    if (Number(test.weightage) < 0) next.weightage = 'Weightage cannot be negative';
    if (!test.term) next.term = 'Term is required';
    if (!test.examinationType) next.examinationType = 'Examination type is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreateAssessment = async () => {
    try {
      if (!validateTest()) return;
      setLoading(true);
      const payload = {
        classId,
        subjectId,
        name: test.name,
        date: test.date,
        maxMarks: Number(test.maxMarks),
        weightage: Number(test.weightage || 0),
        term: test.term,
        examinationType: test.examinationType,
        notes: test.notes || '',
      };
      const res = await assessmentsAPI.createAssessment(payload);
      if (res.success) {
        setAssessmentId(res.data?.id || res.data?.assessment?.id);
        Alert.alert('Created', 'Assessment draft created');
      } else {
        Alert.alert('Error', res.message || 'Failed to create');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async () => {
    try {
      if (!canSaveMarks) return;
      setLoading(true);
      // Validate marks against max
      const maxAllowed = Number(test.maxMarks) || 0;
      for (const s of students) {
        const sid = s.id || s.studentId || s.student_id;
        const row = marksMap[sid];
        if (row && row.marks !== null && row.marks !== undefined) {
          if (row.marks < 0 || row.marks > maxAllowed) {
            setLoading(false);
            Alert.alert('Invalid marks', `Marks for ${s.name || sid} must be between 0 and ${maxAllowed}.`);
            return;
          }
        }
      }
      const rows = students.map((s) => {
        const sid = s.id || s.studentId || s.student_id;
        const row = marksMap[sid] || {};
        return {
          studentId: sid,
          student_id: sid,
          marks: row.marks ?? null,
          absent: !!row.absent,
          remarks: row.remarks || '',
        };
      });
      const res = await assessmentsAPI.bulkUpsertMarks(assessmentId, rows, `fe_${Date.now()}`);
      if (res.success) {
        Alert.alert('Saved', 'Marks saved');
      } else {
        Alert.alert('Error', res.message || 'Failed to save');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!assessmentId) return;
      setLoading(true);
      const res = await assessmentsAPI.generateReport(assessmentId, { format: 'csv' });
      if (res.success) {
        Alert.alert('Report', 'Report generation requested');
      } else {
        Alert.alert('Error', res.message || 'Failed to generate report');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (!assessmentId) return;
      setLoading(true);
      const res = await assessmentsAPI.publish(assessmentId, { notify: false });
      if (res.success) {
        Alert.alert('Published', 'Assessment published');
      } else {
        Alert.alert('Error', res.message || 'Failed to publish');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async () => {
    try {
      if (!assessmentId) return;
      setLoading(true);
      const res = await assessmentsAPI.notify(assessmentId, {
        notify: true,
        channels: ['inApp', 'email'],
        audience: 'all',
        attachReport: true,
        message: 'Results are now available.',
      });
      if (res.success) {
        Alert.alert('Sent', 'Notifications queued');
      } else {
        Alert.alert('Error', res.message || 'Failed to notify');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to notify');
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }) => {
    const sid = item.id || item.studentId || item.student_id;
    const current = marksMap[sid] || {};
    const maxAllowed = Number(test.maxMarks) || 0;
    const handleMarksChange = (t) => {
      const value = t === '' ? null : Number(t);
      let clamped = value;
      if (value !== null && !Number.isNaN(value)) {
        clamped = Math.max(0, Math.min(maxAllowed, value));
      }
      setMarksMap((m) => ({ ...m, [sid]: { ...m[sid], marks: clamped } }));
    };
    return (
      <View style={styles.studentRow}>
        <Text style={styles.studentName}>{item.name || item.full_name || item.roll_no || sid}</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Marks"
          value={current.marks !== undefined && current.marks !== null ? String(current.marks) : ''}
          onChangeText={handleMarksChange}
          editable={!current.absent}
          style={[
            styles.marksInput,
            current.absent && styles.marksInputDisabled
          ]}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity 
          onPress={() => setMarksMap((m) => ({ ...m, [sid]: { ...m[sid], absent: !m[sid]?.absent } }))}
          style={[
            styles.statusButton,
            current.absent ? styles.statusButtonAbsent : styles.statusButtonPresent
          ]}
        >
          <Text style={[
            styles.statusButtonText,
            current.absent ? styles.statusButtonTextAbsent : styles.statusButtonTextPresent
          ]}>
            {current.absent ? '❌ Absent' : '✅ Present'}
          </Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Remarks"
          value={current.remarks || ''}
          onChangeText={(t) => setMarksMap((m) => ({ ...m, [sid]: { ...m[sid], remarks: t } }))}
          style={styles.remarksInput}
          placeholderTextColor="#9ca3af"
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Marks Entry</Text>
        <Text style={styles.subtitle}>Create assessments and enter student marks</Text>
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Class and Subject Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🎓 Class Context</Text>
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Academic Year <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="e.g., 2024-2025" 
              value={year} 
              onChangeText={setYear}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Semester <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="e.g., 1, 2, 3" 
              value={semester} 
              onChangeText={setSemester}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Class/Section <Text style={styles.required}>*</Text></Text>
          <View style={[styles.dropdown, errors.classId && styles.inputError]}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    onPress={() => setClassId(cls.id)}
                    style={[
                      styles.dropdownItem,
                      classId === cls.id && styles.dropdownItemSelected
                    ]}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      classId === cls.id && styles.dropdownItemTextSelected
                    ]}>
                      {cls.name} ({cls.grade_level}) - {cls.academic_year}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No classes available</Text>
                </View>
              )}
            </ScrollView>
          </View>
          {errors.classId ? <Text style={styles.errorText}>{errors.classId}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
          <View style={[styles.dropdown, errors.subjectId && styles.inputError]}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {subjects.length > 0 ? (
                subjects.map((subj) => (
                  <TouchableOpacity
                    key={subj.id}
                    onPress={() => {
                      setSubjectId(subj.id);
                      setTest((t) => ({ ...t, subjectId: subj.id }));
                    }}
                    style={[
                      styles.dropdownItem,
                      subjectId === subj.id && styles.dropdownItemSelected
                    ]}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      subjectId === subj.id && styles.dropdownItemTextSelected
                    ]}>
                      {subj.name || subj.subject_name || subj.code}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {classId ? 'No subjects available for this class' : 'Select a class first'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
          {errors.subjectId ? <Text style={styles.errorText}>{errors.subjectId}</Text> : null}
        </View>

        <TouchableOpacity 
          onPress={handleFetchRoster} 
          style={[styles.primaryButton, !classId && styles.buttonDisabled]}
          disabled={!classId}
        >
          <Text style={styles.primaryButtonText}>👥 Load Students</Text>
        </TouchableOpacity>
      </View>


      {/* Test details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📋 Test Details</Text>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.label}>Test Name <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="Enter Test Name" 
              value={test.name} 
              onChangeText={(v) => setTest((t) => ({ ...t, name: v }))}
              style={[styles.input, errors.name && styles.inputError]}
              placeholderTextColor="#9ca3af"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="YYYY-MM-DD" 
              value={test.date} 
              onChangeText={(v) => setTest((t) => ({ ...t, date: v }))}
              style={[styles.input, errors.date && styles.inputError]}
              placeholderTextColor="#9ca3af"
            />
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Marks <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="e.g. 100" 
              keyboardType="numeric" 
              value={String(test.maxMarks)} 
              onChangeText={(v) => setTest((t) => ({ ...t, maxMarks: Number(v || 0) }))}
              style={[styles.input, errors.maxMarks && styles.inputError]}
              placeholderTextColor="#9ca3af"
            />
            {errors.maxMarks ? <Text style={styles.errorText}>{errors.maxMarks}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weightage (%)</Text>
            <TextInput 
              placeholder="e.g. 10" 
              keyboardType="numeric" 
              value={String(test.weightage)} 
              onChangeText={(v) => setTest((t) => ({ ...t, weightage: Number(v || 0) }))}
              style={[styles.input, errors.weightage && styles.inputError]}
              placeholderTextColor="#9ca3af"
            />
            {errors.weightage ? <Text style={styles.errorText}>{errors.weightage}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Term <Text style={styles.required}>*</Text></Text>
            <TextInput 
              placeholder="e.g. T1" 
              value={test.term} 
              onChangeText={(v) => setTest((t) => ({ ...t, term: v }))}
              style={[styles.input, errors.term && styles.inputError]}
              placeholderTextColor="#9ca3af"
            />
            {errors.term ? <Text style={styles.errorText}>{errors.term}</Text> : null}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Examination Type <Text style={styles.required}>*</Text></Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setTest((t) => ({ ...t, examinationType: 'internal' }))}
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                test.examinationType === 'internal' && styles.toggleButtonActive
              ]}
            >
              <Text style={[
                styles.toggleButtonText,
                test.examinationType === 'internal' && styles.toggleButtonTextActive
              ]}>
                📚 Internals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTest((t) => ({ ...t, examinationType: 'external' }))}
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                test.examinationType === 'external' && styles.toggleButtonActive
              ]}
            >
              <Text style={[
                styles.toggleButtonText,
                test.examinationType === 'external' && styles.toggleButtonTextActive
              ]}>
                🎯 External
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput 
            placeholder="Optional notes (syllabus, instructions)" 
            value={test.notes} 
            onChangeText={(v) => setTest((t) => ({ ...t, notes: v }))}
            style={styles.textArea}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          onPress={handleCreateAssessment} 
          disabled={!canCreate}
          style={[styles.primaryButton, !canCreate && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonText}>
            {assessmentId ? '✅ Assessment Created' : '📝 Create Assessment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Marks table */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Enter Marks</Text>
        </View>
        
        {students.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: 120 }]}>Student</Text>
              <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Marks</Text>
              <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Status</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, marginLeft: 8 }]}>Remarks</Text>
            </View>
            <View style={styles.bulkActionsContainer}>
              <TouchableOpacity 
                onPress={() => setMarksMap((m) => {
                  const next = { ...m };
                  students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), absent: false }; });
                  return next;
                })} 
                style={styles.bulkActionButton}
              >
                <Text style={styles.bulkActionText}>✅ All Present</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMarksMap((m) => {
                  const next = { ...m };
                  students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), absent: true, marks: null }; });
                  return next;
                })} 
                style={styles.bulkActionButton}
              >
                <Text style={styles.bulkActionText}>❌ All Absent</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMarksMap((m) => {
                  const next = { ...m };
                  students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; if (next[sid]) next[sid] = { ...next[sid], marks: null }; });
                  return next;
                })} 
                style={styles.bulkActionButton}
              >
                <Text style={styles.bulkActionText}>🗑️ Clear Marks</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  const maxAllowed = Number(test.maxMarks) || 0;
                  setMarksMap((m) => {
                    const next = { ...m };
                    students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), marks: maxAllowed, absent: false }; });
                    return next;
                  });
                }} 
                style={styles.bulkActionButton}
              >
                <Text style={styles.bulkActionText}>🎯 Fill Max</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={students}
              keyExtractor={(item, index) => String(item.id || item.studentId || item.student_id || index)}
              renderItem={renderStudent}
              ItemSeparatorComponent={() => <View style={styles.studentSeparator} />}
              style={styles.studentsList}
            />

            <TouchableOpacity 
              onPress={handleSaveMarks} 
              disabled={!canSaveMarks}
              style={[styles.primaryButton, !canSaveMarks && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>💾 Save Marks</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No students loaded. Please select a class and load students first.</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={handleGenerateReport} 
          disabled={!assessmentId}
          style={[styles.actionButton, styles.reportButton, !assessmentId && styles.buttonDisabled]}
        >
          <Text style={styles.actionButtonText}>📊 Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handlePublish} 
          disabled={!assessmentId}
          style={[styles.actionButton, styles.publishButton, !assessmentId && styles.buttonDisabled]}
        >
          <Text style={styles.actionButtonText}>🚀 Publish</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNotify} 
          disabled={!assessmentId}
          style={[styles.actionButton, styles.notifyButton, !assessmentId && styles.buttonDisabled]}
        >
          <Text style={styles.actionButtonText}>📧 Notify Parents</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    maxHeight: 120,
  },
  dropdownScroll: {
    maxHeight: 120,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemSelected: {
    backgroundColor: '#3b82f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  toggleButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  toggleButtonRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#d1d5db',
  },
  toggleButtonActive: {
    backgroundColor: '#3b82f6',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  tableHeaderText: {
    fontWeight: '600',
    color: '#475569',
    fontSize: 14,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bulkActionButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    minWidth: 80,
  },
  bulkActionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  studentsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  studentSeparator: {
    height: 8,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#7c3aed',
  },
  publishButton: {
    backgroundColor: '#f59e0b',
  },
  notifyButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentName: {
    width: 120,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  marksInput: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 8,
    width: 80,
    backgroundColor: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  marksInputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  statusButton: {
    padding: 8,
    borderRadius: 6,
    width: 80,
    alignItems: 'center',
  },
  statusButtonPresent: {
    backgroundColor: '#dcfce7',
  },
  statusButtonAbsent: {
    backgroundColor: '#fee2e2',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusButtonTextPresent: {
    color: '#166534',
  },
  statusButtonTextAbsent: {
    color: '#dc2626',
  },
  remarksInput: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
});
