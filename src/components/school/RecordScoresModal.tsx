import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants';
import { RosterMember, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  classId: string;
  roster: RosterMember[];
  /** Pre-fill the assessment name (e.g. when editing an existing one). */
  initialName?: string;
  onClose: () => void;
  onSaved: (assessmentName: string) => void;
}

const rosterName = (m: RosterMember) =>
  `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;

const RecordScoresModal: React.FC<Props> = ({ visible, classId, roster, initialName, onClose, onSaved }) => {
  const [name, setName] = useState(initialName ?? '');
  const [maxScore, setMaxScore] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName(initialName ?? '');
    setMaxScore('');
    setScores({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    const assessmentName = name.trim();
    if (!assessmentName) {
      Alert.alert('Name required', 'Name the assessment, e.g. "AP Stats EOC".');
      return;
    }
    const entries = Object.entries(scores)
      .map(([studentId, raw]) => ({ studentId, value: parseFloat(raw) }))
      .filter((e) => e.value !== undefined && !Number.isNaN(e.value));

    if (entries.length === 0) {
      Alert.alert('No scores', 'Enter at least one score to save.');
      return;
    }

    const max = maxScore.trim() ? parseFloat(maxScore) : null;
    setSaving(true);
    let firstError: string | null = null;
    for (const e of entries) {
      const { error } = await schoolService.upsertAssessment({
        studentId: e.studentId,
        assessmentName,
        score: e.value,
        maxScore: max,
        classId,
      });
      if (error && !firstError) firstError = error;
    }
    setSaving(false);

    if (firstError) {
      Alert.alert('Some scores did not save', firstError);
      return;
    }
    reset();
    onSaved(assessmentName);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            maxHeight: '88%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>Record Scores</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: Colors.gray500, marginBottom: 12 }}>
            Stored privately to you. Used to compare doors earned with performance. Only you can see scores.
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Assessment, e.g. AP Stats EOC"
              placeholderTextColor={Colors.gray400}
              value={name}
              onChangeText={setName}
              maxLength={60}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Max"
              placeholderTextColor={Colors.gray400}
              value={maxScore}
              onChangeText={setMaxScore}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
            {roster.map((m) => (
              <View
                key={m.student_id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.gray100,
                }}
              >
                <Text style={{ flex: 1, fontSize: 15, color: Colors.gray800 }}>{rosterName(m)}</Text>
                <TextInput
                  style={[styles.input, { width: 90, marginBottom: 0, textAlign: 'center' }]}
                  placeholder="-"
                  placeholderTextColor={Colors.gray400}
                  value={scores[m.student_id] ?? ''}
                  onChangeText={(v) => setScores((prev) => ({ ...prev, [m.student_id]: v }))}
                  keyboardType="numeric"
                  maxLength={7}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Save Scores</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.gray900,
    marginBottom: 8,
  },
};

export default RecordScoresModal;
