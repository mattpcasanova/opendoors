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
import { schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  teacherId: string;
  student?: { id: string; name: string } | null;
  bulk?: { studentIds: string[]; label: string } | null;
  onClose: () => void;
  onSent: () => void;
}

const SendDoorsModal: React.FC<Props> = ({ visible, teacherId, student, bulk, onClose, onSent }) => {
  const [count, setCount] = useState(1);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  const targetName = bulk?.label ?? student?.name ?? '';

  const reset = () => {
    setCount(1);
    setReason('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    const reasonText = reason.trim() || 'From your teacher';
    setSending(true);

    if (bulk) {
      let sent = 0;
      let firstError: string | null = null;
      for (const sid of bulk.studentIds) {
        const { success, error } = await schoolService.sendDoorsToStudent(teacherId, sid, count, reasonText);
        if (success) sent += 1;
        else if (!firstError) firstError = error ?? 'Failed';
      }
      setSending(false);
      if (sent === 0) {
        Alert.alert('Could not send doors', firstError || 'Please try again.');
        return;
      }
      reset();
      onSent();
      return;
    }

    if (!student) {
      setSending(false);
      return;
    }
    const { success, error } = await schoolService.sendDoorsToStudent(teacherId, student.id, count, reasonText);
    setSending(false);
    if (!success) {
      Alert.alert('Could not send doors', error || 'Please try again.');
      return;
    }
    reset();
    onSent();
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
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>Send Doors</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: Colors.gray500, marginBottom: 16 }}>
            {bulk
              ? `${count} ${count === 1 ? 'door' : 'doors'} to each of ${bulk.studentIds.length} students`
              : `Game plays for ${targetName}`}
          </Text>

          {/* Stepper */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            <Stepper icon="remove" onPress={() => setCount((c) => Math.max(1, c - 1))} />
            <Text style={{ fontSize: 40, fontWeight: '800', color: Colors.primary, minWidth: 60, textAlign: 'center' }}>
              {count}
            </Text>
            <Stepper icon="add" onPress={() => setCount((c) => Math.min(20, c + 1))} />
          </View>

          <TextInput
            style={{
              backgroundColor: Colors.gray50,
              borderWidth: 1,
              borderColor: Colors.gray200,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: Colors.gray900,
              marginBottom: 12,
            }}
            placeholder="Reason (optional), e.g. Great participation!"
            placeholderTextColor={Colors.gray400}
            value={reason}
            onChangeText={setReason}
            maxLength={100}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>
                {bulk ? `Send to ${bulk.studentIds.length} students` : `Send ${count} ${count === 1 ? 'Door' : 'Doors'}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Stepper: React.FC<{ icon: keyof typeof Ionicons.glyphMap; onPress: () => void }> = ({ icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: Colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Ionicons name={icon} size={28} color={Colors.primary} />
  </TouchableOpacity>
);

export default SendDoorsModal;
