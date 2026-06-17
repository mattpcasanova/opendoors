import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants';
import { ClassGoal, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  classId: string;
  current?: ClassGoal | null;
  onClose: () => void;
  onSaved: () => void;
}

const ClassGoalModal: React.FC<Props> = ({ visible, classId, current, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(current?.title ?? '');
      setTarget(current ? String(current.target_doors) : '');
    }
  }, [visible, current]);

  const handleSave = async () => {
    const targetNum = parseInt(target, 10);
    if (!title.trim()) {
      Alert.alert('Title required', 'Name the reward, e.g. "Movie day".');
      return;
    }
    if (!targetNum || targetNum <= 0) {
      Alert.alert('Target required', 'Enter how many doors the class needs.');
      return;
    }
    setSaving(true);
    const { error } = await schoolService.setClassGoal(classId, title.trim(), targetNum);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    onSaved();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>Class goal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: Colors.gray500, marginBottom: 12 }}>
            When the class is sent this many doors total, they hit the reward.
          </Text>

          <Text style={styles.label}>Reward</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Movie day"
            placeholderTextColor={Colors.gray400}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Text style={styles.label}>Doors needed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 200"
            placeholderTextColor={Colors.gray400}
            value={target}
            onChangeText={(t) => setTarget(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={5}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Save goal</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gray700,
    marginBottom: 6,
    marginTop: 8,
  },
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

export default ClassGoalModal;
