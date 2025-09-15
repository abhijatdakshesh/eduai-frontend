import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { assessmentsAPI } from '../services/apiService';
import { apiClient } from '../services/api';

const initialTestState = {
  name: '',
  date: new Date().toISOString().slice(0, 10),
  maxMarks: 100,
  weightage: 0,
  term: 'T1',
  subjectId: '',
  notes: '',
};

export default function TeacherMarksEntryScreen() {
  const [departmentId, setDepartmentId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [test, setTest] = useState(initialTestState);
  const [assessmentId, setAssessmentId] = useState(null);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const canCreate = useMemo(() => sectionId && subjectId && test.name && test.maxMarks > 0, [sectionId, subjectId, test]);
  const canSaveMarks = useMemo(() => assessmentId && Object.keys(marksMap).length > 0, [assessmentId, marksMap]);

  const handleFetchRoster = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getSectionStudents(sectionId);
      if (res?.success) {
        setStudents(res.data?.students || res.data || []);
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
    if (!sectionId) next.sectionId = 'Section is required';
    if (!subjectId) next.subjectId = 'Subject is required';
    if (!test.name) next.name = 'Test name is required';
    if (!test.date || !/^\d{4}-\d{2}-\d{2}$/.test(test.date)) next.date = 'Date must be YYYY-MM-DD';
    if (!(Number(test.maxMarks) > 0)) next.maxMarks = 'Max marks must be > 0';
    if (Number(test.weightage) < 0) next.weightage = 'Weightage cannot be negative';
    if (!test.term) next.term = 'Term is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreateAssessment = async () => {
    try {
      if (!validateTest()) return;
      setLoading(true);
      const payload = {
        sectionId,
        subjectId,
        name: test.name,
        date: test.date,
        maxMarks: Number(test.maxMarks),
        weightage: Number(test.weightage || 0),
        term: test.term,
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
      const rows = students.map((s) => ({
        studentId: s.id || s.studentId || s.student_id,
        marks: marksMap[s.id || s.studentId || s.student_id]?.marks ?? null,
        absent: marksMap[s.id || s.studentId || s.student_id]?.absent || false,
        remarks: marksMap[s.id || s.studentId || s.student_id]?.remarks || '',
      }));
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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ width: 120 }}>{item.name || item.full_name || item.roll_no || sid}</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Marks"
          value={current.marks !== undefined && current.marks !== null ? String(current.marks) : ''}
          onChangeText={handleMarksChange}
          editable={!current.absent}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginHorizontal: 8, width: 80, backgroundColor: current.absent ? '#f3f4f6' : 'white' }}
        />
        <TouchableOpacity onPress={() => setMarksMap((m) => ({ ...m, [sid]: { ...m[sid], absent: !m[sid]?.absent } }))}
          style={{ padding: 8, backgroundColor: current.absent ? '#fee2e2' : '#e5e7eb', borderRadius: 6 }}>
          <Text>{current.absent ? 'Absent' : 'Present'}</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Remarks"
          value={current.remarks || ''}
          onChangeText={(t) => setMarksMap((m) => ({ ...m, [sid]: { ...m[sid], remarks: t } }))}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginLeft: 8, flex: 1 }}
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Teacher Marks Entry</Text>
      {loading && (
        <View style={{ paddingVertical: 8 }}><ActivityIndicator /></View>
      )}

      {/* Minimal inputs for Department, Section, Subject */}
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Class Context</Text>
        <Text style={{ marginBottom: 4 }}>Department ID</Text>
        <TextInput placeholder="Enter Department ID" value={departmentId} onChangeText={setDepartmentId}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8 }} />

        <Text style={{ marginBottom: 4 }}>Section ID <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="Enter Section ID" value={sectionId} onChangeText={setSectionId}
          style={{ borderWidth: 1, borderColor: errors.sectionId ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.sectionId ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.sectionId}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Subject ID <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="Enter Subject ID" value={subjectId} onChangeText={(v) => { setSubjectId(v); setTest((t) => ({ ...t, subjectId: v })); }}
          style={{ borderWidth: 1, borderColor: errors.subjectId ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.subjectId ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.subjectId}</Text> : null}

        <TouchableOpacity onPress={handleFetchRoster} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginTop: 4 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Load Students</Text>
        </TouchableOpacity>
      </View>


      {/* Test details */}
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Test Details</Text>

        <Text style={{ marginBottom: 4 }}>Test Name <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="Enter Test Name" value={test.name} onChangeText={(v) => setTest((t) => ({ ...t, name: v }))}
          style={{ borderWidth: 1, borderColor: errors.name ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.name ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.name}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Date (YYYY-MM-DD) <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="YYYY-MM-DD" value={test.date} onChangeText={(v) => setTest((t) => ({ ...t, date: v }))}
          style={{ borderWidth: 1, borderColor: errors.date ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.date ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.date}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Max Marks <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="e.g. 100" keyboardType="numeric" value={String(test.maxMarks)} onChangeText={(v) => setTest((t) => ({ ...t, maxMarks: Number(v || 0) }))}
          style={{ borderWidth: 1, borderColor: errors.maxMarks ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.maxMarks ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.maxMarks}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Weightage (%)</Text>
        <TextInput placeholder="e.g. 10" keyboardType="numeric" value={String(test.weightage)} onChangeText={(v) => setTest((t) => ({ ...t, weightage: Number(v || 0) }))}
          style={{ borderWidth: 1, borderColor: errors.weightage ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.weightage ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.weightage}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Term <Text style={{ color: '#dc2626' }}>*</Text></Text>
        <TextInput placeholder="e.g. T1" value={test.term} onChangeText={(v) => setTest((t) => ({ ...t, term: v }))}
          style={{ borderWidth: 1, borderColor: errors.term ? '#dc2626' : '#ddd', borderRadius: 6, padding: 10, marginBottom: 4 }} />
        {errors.term ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{errors.term}</Text> : null}

        <Text style={{ marginBottom: 4 }}>Notes</Text>
        <TextInput placeholder="Optional notes (syllabus, instructions)" value={test.notes} onChangeText={(v) => setTest((t) => ({ ...t, notes: v }))}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8 }} />

        <TouchableOpacity onPress={handleCreateAssessment} disabled={!canCreate}
          style={{ backgroundColor: canCreate ? '#16a34a' : '#9ca3af', padding: 12, borderRadius: 8, marginTop: 4 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>{assessmentId ? 'Assessment Created' : 'Create Assessment'}</Text>
        </TouchableOpacity>
      </View>

      {/* Marks table */}
      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Enter Marks</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <Text style={{ width: 120, fontWeight: '600' }}>Student</Text>
        <Text style={{ width: 80, fontWeight: '600', textAlign: 'center' }}>Marks</Text>
        <Text style={{ width: 80, fontWeight: '600', textAlign: 'center' }}>Status</Text>
        <Text style={{ flex: 1, fontWeight: '600', marginLeft: 8 }}>Remarks</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => setMarksMap((m) => {
          const next = { ...m };
          students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), absent: false }; });
          return next;
        })} style={{ backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 }}>
          <Text>All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMarksMap((m) => {
          const next = { ...m };
          students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), absent: true, marks: null }; });
          return next;
        })} style={{ backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 }}>
          <Text>All Absent</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMarksMap((m) => {
          const next = { ...m };
          students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; if (next[sid]) next[sid] = { ...next[sid], marks: null }; });
          return next;
        })} style={{ backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 }}>
          <Text>Clear Marks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const maxAllowed = Number(test.maxMarks) || 0;
          setMarksMap((m) => {
            const next = { ...m };
            students.forEach((s) => { const sid = s.id || s.studentId || s.student_id; next[sid] = { ...(next[sid] || {}), marks: maxAllowed, absent: false }; });
            return next;
          });
        }} style={{ backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}>
          <Text>Fill Max</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={students}
        keyExtractor={(item, index) => String(item.id || item.studentId || item.student_id || index)}
        renderItem={renderStudent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <TouchableOpacity onPress={handleSaveMarks} disabled={!canSaveMarks}
        style={{ backgroundColor: canSaveMarks ? '#0ea5e9' : '#9ca3af', padding: 12, borderRadius: 8, marginVertical: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Save Marks</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGenerateReport} disabled={!assessmentId}
        style={{ backgroundColor: assessmentId ? '#7c3aed' : '#9ca3af', padding: 12, borderRadius: 8, marginBottom: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Generate Report</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePublish} disabled={!assessmentId}
        style={{ backgroundColor: assessmentId ? '#f59e0b' : '#9ca3af', padding: 12, borderRadius: 8, marginBottom: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Publish</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNotify} disabled={!assessmentId}
        style={{ backgroundColor: assessmentId ? '#ef4444' : '#9ca3af', padding: 12, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Notify Parents</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


