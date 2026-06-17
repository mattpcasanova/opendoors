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
  onClose: () => void;
  onJoined: (className: string) => void;
}

const JoinClassModal: React.FC<Props> = ({ visible, onClose, onJoined }) => {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Enter a code', 'Ask your teacher for the class code.');
      return;
    }
    setJoining(true);
    const { data, error } = await schoolService.joinClassByCode(code.trim());
    setJoining(false);
    if (error || !data) {
      Alert.alert('Could not join', error || 'Check the code and try again.');
      return;
    }
    setCode('');
    onJoined(data.name);
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
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>Join a class</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: Colors.gray500, marginBottom: 12 }}>
            Enter the code your teacher gave you.
          </Text>
          <TextInput
            style={{
              backgroundColor: Colors.gray50,
              borderWidth: 1,
              borderColor: Colors.gray200,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 24,
              fontWeight: '700',
              letterSpacing: 8,
              textAlign: 'center',
              color: Colors.gray900,
              marginBottom: 12,
            }}
            placeholder="ABC123"
            placeholderTextColor={Colors.gray400}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
          <TouchableOpacity
            onPress={handleJoin}
            disabled={joining}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: joining ? 0.6 : 1,
            }}
          >
            {joining ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Join</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinClassModal;
