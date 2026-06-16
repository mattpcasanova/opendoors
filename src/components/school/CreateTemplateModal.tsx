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
import { ClassRow, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  teacherId: string;
  classes: ClassRow[];
  onClose: () => void;
  onCreated: () => void;
}

const CreateTemplateModal: React.FC<Props> = ({ visible, teacherId, classes, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState<string | null>(null); // null = all classes
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setClassId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give the reward a name, e.g. "Homework Pass".');
      return;
    }
    setSaving(true);
    const { error } = await schoolService.createTemplate({
      teacher_id: teacherId,
      class_id: classId,
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not create the reward. Please try again.');
      return;
    }
    reset();
    onCreated();
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>New Reward</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Reward name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Homework Pass"
              placeholderTextColor={Colors.gray400}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="e.g. Skip one homework assignment"
              placeholderTextColor={Colors.gray400}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={140}
            />

            <Text style={styles.label}>Applies to</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <Chip label="All my classes" active={classId === null} onPress={() => setClassId(null)} />
              {classes.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={classId === c.id}
                  onPress={() => setClassId(c.id)}
                />
              ))}
            </View>
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
              marginTop: 12,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Create Reward</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: active ? Colors.primary : Colors.gray100,
      borderWidth: 1,
      borderColor: active ? Colors.primary : Colors.gray200,
    }}
  >
    <Text style={{ color: active ? Colors.white : Colors.gray700, fontWeight: '600', fontSize: 13 }}>
      {label}
    </Text>
  </TouchableOpacity>
);

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

export default CreateTemplateModal;
