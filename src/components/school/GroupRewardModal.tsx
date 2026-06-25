import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { RewardClass, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  classId: string;
  onClose: () => void;
  onCreated: () => void;
}

const GroupRewardModal: React.FC<Props> = ({ visible, classId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [rewardClass, setRewardClass] = useState<RewardClass>('school');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setTarget('');
    setRewardClass('school');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    const t = parseInt(target, 10);
    if (!title.trim()) {
      Alert.alert('Title required', 'Name the group reward, e.g. "Pizza Party".');
      return;
    }
    if (!t || t <= 0) {
      Alert.alert('Target required', 'Set how many doors the class needs to pool.');
      return;
    }
    setSaving(true);
    const { error } = await schoolService.createGroupReward({
      classId,
      title: title.trim(),
      target: t,
      description: description.trim() || undefined,
      rewardClass,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not create the group reward. Please try again.');
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
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>New Group Reward</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: Colors.gray500, marginBottom: 16 }}>
            The class pools their own doors to unlock this together.
          </Text>

          <Text style={label}>Reward name</Text>
          <TextInput
            style={input}
            placeholder='e.g. Pizza Party'
            placeholderTextColor={Colors.gray400}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Text style={label}>Description (optional)</Text>
          <TextInput
            style={[input, { height: 70, textAlignVertical: 'top' }]}
            placeholder='e.g. Whole class earns a pizza day'
            placeholderTextColor={Colors.gray400}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={140}
          />

          <Text style={label}>Doors needed</Text>
          <TextInput
            style={input}
            placeholder='e.g. 100'
            placeholderTextColor={Colors.gray400}
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
            maxLength={5}
          />

          <Text style={label}>Counts which doors</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <ClassToggle icon="fast-food" labelText="Food" active={rewardClass === 'food'} onPress={() => setRewardClass('food')} />
            <ClassToggle icon="school" labelText="School" active={rewardClass === 'school'} onPress={() => setRewardClass('school')} />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Create Group Reward</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ClassToggle: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  labelText: string;
  active: boolean;
  onPress: () => void;
}> = ({ icon, labelText, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: active ? Colors.primary : Colors.gray200,
      backgroundColor: active ? Colors.primaryMuted : Colors.white,
    }}
  >
    <Ionicons name={icon} size={18} color={active ? Colors.primary : Colors.gray400} />
    <Text style={{ fontSize: 14, fontWeight: '600', color: active ? Colors.primary : Colors.gray600 }}>{labelText}</Text>
  </TouchableOpacity>
);

const label = {
  fontSize: 14,
  fontWeight: '600' as const,
  color: Colors.gray700,
  marginBottom: 6,
  marginTop: 8,
};

const input = {
  backgroundColor: Colors.gray50,
  borderWidth: 1,
  borderColor: Colors.gray200,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: Colors.gray900,
  marginBottom: 8,
};

export default GroupRewardModal;
