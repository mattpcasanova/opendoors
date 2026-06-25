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
import { ClassRow, RewardClass, RewardType, schoolService } from '../../services/schoolService';

interface Props {
  visible: boolean;
  teacherId: string;
  classes: ClassRow[];
  onClose: () => void;
  onCreated: () => void;
}

const DOOR_OPTIONS = [
  { doors: 3, odds: '1 in 3' },
  { doors: 5, odds: '1 in 5' },
  { doors: 7, odds: '1 in 7' },
];

const CreateTemplateModal: React.FC<Props> = ({ visible, teacherId, classes, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [rewardType, setRewardType] = useState<RewardType>('game');
  const [rewardClass, setRewardClass] = useState<RewardClass>('school');
  const [doors, setDoors] = useState(3);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setApplyToAll(true);
    setSelectedClassIds([]);
    setRewardType('game');
    setRewardClass('school');
    setDoors(3);
  };

  const toggleClass = (id: string) => {
    setApplyToAll(false);
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllClasses = () => {
    setApplyToAll(true);
    setSelectedClassIds([]);
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
    if (!applyToAll && selectedClassIds.length === 0) {
      Alert.alert('Pick classes', 'Choose at least one class, or "All my classes".');
      return;
    }
    setSaving(true);
    // "All classes" is one template (class_id null); otherwise one per chosen class.
    const targets = applyToAll ? [null] : selectedClassIds;
    let firstError: string | null = null;
    for (const class_id of targets) {
      const { error } = await schoolService.createTemplate({
        teacher_id: teacherId,
        class_id,
        title: title.trim(),
        description: description.trim() || undefined,
        reward_type: rewardType,
        reward_class: rewardClass,
        doors: rewardType === 'game' ? doors : 3,
      });
      if (error && !firstError) firstError = error;
    }
    setSaving(false);
    if (firstError) {
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

            <Text style={styles.label}>Reward kind</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <ClassOption
                icon="fast-food"
                label="Food"
                sublabel="Fries, cookie, coffee…"
                active={rewardClass === 'food'}
                onPress={() => setRewardClass('food')}
              />
              <ClassOption
                icon="school"
                label="School"
                sublabel="Bonus point, HW pass…"
                active={rewardClass === 'school'}
                onPress={() => setRewardClass('school')}
              />
            </View>

            <Text style={styles.label}>How students get it</Text>
            <View style={{ gap: 8, marginBottom: 8 }}>
              <TypeOption
                title="Give directly"
                subtitle="Student taps to use it, you confirm in class"
                active={rewardType === 'direct'}
                onPress={() => setRewardType('direct')}
              />
              <TypeOption
                title="Play to win"
                subtitle="Student plays a door game for a chance to win it"
                active={rewardType === 'game'}
                onPress={() => setRewardType('game')}
              />
            </View>

            {rewardType === 'game' && (
              <>
                <Text style={styles.label}>Difficulty (more doors = harder = better prize)</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {DOOR_OPTIONS.map((opt) => {
                    const active = doors === opt.doors;
                    return (
                      <TouchableOpacity
                        key={opt.doors}
                        onPress={() => setDoors(opt.doors)}
                        activeOpacity={0.8}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          backgroundColor: active ? Colors.primary : Colors.gray100,
                          borderWidth: 1,
                          borderColor: active ? Colors.primary : Colors.gray200,
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '800', color: active ? Colors.white : Colors.gray800 }}>
                          {opt.doors}
                        </Text>
                        <Text style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.85)' : Colors.gray500, marginTop: 2 }}>
                          {opt.odds}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>Applies to</Text>
            <Text style={{ fontSize: 12, color: Colors.gray500, marginBottom: 8, marginTop: -2 }}>
              Pick "All my classes", or tap one or more periods.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <Chip label="All my classes" active={applyToAll} onPress={selectAllClasses} />
              {classes.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={!applyToAll && selectedClassIds.includes(c.id)}
                  onPress={() => toggleClass(c.id)}
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

const ClassOption: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  active: boolean;
  onPress: () => void;
}> = ({ icon, label, sublabel, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flex: 1,
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: active ? Colors.primary : Colors.gray200,
      backgroundColor: active ? Colors.primaryMuted : Colors.white,
    }}
  >
    <Ionicons name={icon} size={24} color={active ? Colors.primary : Colors.gray400} />
    <Text style={{ fontSize: 15, fontWeight: '700', color: active ? Colors.primary : Colors.gray800, marginTop: 6 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 11, color: Colors.gray500, marginTop: 2, textAlign: 'center' }}>{sublabel}</Text>
  </TouchableOpacity>
);

const TypeOption: React.FC<{ title: string; subtitle: string; active: boolean; onPress: () => void }> = ({ title, subtitle, active, onPress }) => (
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
    }}
  >
    <Ionicons
      name={active ? 'radio-button-on' : 'radio-button-off'}
      size={22}
      color={active ? Colors.primary : Colors.gray400}
    />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 2 }}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

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
