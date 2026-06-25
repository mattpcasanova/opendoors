import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants';
import { GroupRewardStudent, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  reward: GroupRewardStudent | null;
  /** How many eligible doors the student can spend on this reward's class. */
  maxDoors: number;
  onClose: () => void;
  onContributed: () => void;
}

const ContributeModal: React.FC<Props> = ({ visible, reward, maxDoors, onClose, onContributed }) => {
  const [count, setCount] = useState(1);
  const [saving, setSaving] = useState(false);

  if (!reward) return null;

  const remaining = Math.max(0, reward.target_doors - reward.progress);
  const cap = Math.max(1, Math.min(maxDoors, remaining));
  const value = Math.min(count, cap);

  const handleClose = () => {
    setCount(1);
    onClose();
  };

  const handleContribute = async () => {
    setSaving(true);
    const { error } = await schoolService.contributeToGroupReward(reward.id, value);
    setSaving(false);
    if (error) {
      Alert.alert('Could not contribute', error);
      return;
    }
    setCount(1);
    onContributed();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 20,
            padding: 20,
            paddingBottom: Platform.OS === 'ios' ? 20 : 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.gray900 }}>Contribute doors</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: Colors.gray500, marginBottom: 16 }} numberOfLines={2}>
            Toward "{reward.title}" · {remaining} more needed
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            <Step icon="remove" disabled={value <= 1} onPress={() => setCount((c) => Math.max(1, Math.min(c, cap) - 1))} />
            <Text style={{ fontSize: 40, fontWeight: '800', color: Colors.primary, minWidth: 60, textAlign: 'center' }}>
              {value}
            </Text>
            <Step icon="add" disabled={value >= cap} onPress={() => setCount((c) => Math.min(cap, c + 1))} />
          </View>

          <Text style={{ textAlign: 'center', color: Colors.gray500, fontSize: 13, marginBottom: 16 }}>
            You can give up to {cap} {reward.reward_class === 'food' ? 'food' : 'school'} door{cap === 1 ? '' : 's'} right now
          </Text>

          <TouchableOpacity
            onPress={handleContribute}
            disabled={saving || cap === 0}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              opacity: saving || cap === 0 ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>
                Give {value} door{value === 1 ? '' : 's'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Step: React.FC<{ icon: keyof typeof Ionicons.glyphMap; disabled?: boolean; onPress: () => void }> = ({ icon, disabled, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={{
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: Colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
    }}
  >
    <Ionicons name={icon} size={28} color={Colors.primary} />
  </TouchableOpacity>
);

export default ContributeModal;
