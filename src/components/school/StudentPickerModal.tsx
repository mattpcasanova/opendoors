import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
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
import { RosterMember } from '../../services/schoolService';

interface Props {
  visible: boolean;
  roster: RosterMember[];
  title?: string;
  /** Optional secondary line per student (e.g. "Rewarded 3d ago"). */
  getSubtitle?: (studentId: string) => string | null;
  onClose: () => void;
  onSelect: (student: { id: string; name: string }) => void;
}

const rosterName = (m: RosterMember) =>
  `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;

const StudentPickerModal: React.FC<Props> = ({
  visible,
  roster,
  title = 'Send doors to a student',
  getSubtitle,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((m) => {
      const name = rosterName(m).toLowerCase();
      return name.includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [roster, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (m: RosterMember) => {
    setQuery('');
    onSelect({ id: m.student_id, name: rosterName(m) });
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray900 }}>{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: Colors.gray50,
              borderWidth: 1,
              borderColor: Colors.gray200,
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            <Ionicons name="search" size={18} color={Colors.gray400} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.gray900 }}
              placeholder="Search students by name"
              placeholderTextColor={Colors.gray400}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.gray400} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="people-outline" size={28} color={Colors.gray400} />
                <Text style={{ color: Colors.gray500, marginTop: 8 }}>
                  {roster.length === 0 ? 'No students in this class yet.' : 'No matching students.'}
                </Text>
              </View>
            ) : (
              filtered.map((m) => {
                const subtitle = getSubtitle?.(m.student_id) ?? m.email;
                return (
                  <TouchableOpacity
                    key={m.student_id}
                    onPress={() => handleSelect(m)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.gray100,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: Colors.primaryMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                        {(m.first_name?.[0] || m.email[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>
                        {rosterName(m)}
                      </Text>
                      {subtitle ? (
                        <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 2 }} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="ticket-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default StudentPickerModal;
