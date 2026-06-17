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
import { RewardTemplate, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  classId: string;
  student: { id: string; name: string } | null;
  templates: RewardTemplate[];
  onClose: () => void;
  onGranted: () => void;
}

const CUSTOM = '__custom__';

const GrantRewardModal: React.FC<Props> = ({ visible, classId, student, templates, onClose, onGranted }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelected(null);
    setCustomTitle('');
    setCustomDesc('');
    setNote('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGrant = async () => {
    if (!student) return;
    if (!selected) {
      Alert.alert('Pick a reward', 'Choose a saved reward or create a one-time one.');
      return;
    }
    if (selected === CUSTOM && !customTitle.trim()) {
      Alert.alert('Title required', 'Enter a name for the one-time reward.');
      return;
    }

    setSaving(true);
    const { error } = await schoolService.grantReward({
      classId,
      studentId: student.id,
      templateId: selected === CUSTOM ? undefined : selected,
      title: selected === CUSTOM ? customTitle.trim() : undefined,
      description: selected === CUSTOM ? customDesc.trim() || undefined : undefined,
      note: note.trim() || undefined,
    });
    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }
    reset();
    onGranted();
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
            maxHeight: '85%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>Give a Reward</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          {student ? (
            <Text style={{ color: Colors.gray500, marginBottom: 12 }}>To {student.name}</Text>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false}>
            {templates.map((t) => (
              <Option
                key={t.id}
                title={t.title}
                subtitle={t.description || undefined}
                active={selected === t.id}
                onPress={() => setSelected(t.id)}
              />
            ))}

            <Option
              title="One-time reward…"
              subtitle="Create something just for this student"
              active={selected === CUSTOM}
              onPress={() => setSelected(CUSTOM)}
              icon="add-circle-outline"
            />

            {selected === CUSTOM && (
              <View style={{ marginTop: 8 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Reward name"
                  placeholderTextColor={Colors.gray400}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  maxLength={60}
                />
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={Colors.gray400}
                  value={customDesc}
                  onChangeText={setCustomDesc}
                  multiline
                  maxLength={140}
                />
              </View>
            )}

            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Add a note (optional) — e.g. Great work today!"
              placeholderTextColor={Colors.gray400}
              value={note}
              onChangeText={setNote}
              maxLength={140}
            />
          </ScrollView>

          <TouchableOpacity
            onPress={handleGrant}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 12,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Give Reward</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Option: React.FC<{
  title: string;
  subtitle?: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({ title, subtitle, active, onPress, icon = 'ribbon-outline' }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: active ? Colors.primary : Colors.gray200,
      backgroundColor: active ? Colors.primaryMuted : Colors.white,
      marginBottom: 10,
    }}
  >
    <Ionicons name={active ? 'checkmark-circle' : icon} size={24} color={active ? Colors.primary : Colors.gray400} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  </TouchableOpacity>
);

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

export default GrantRewardModal;
