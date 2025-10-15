import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import {
    DoorDistribution,
    OrganizationMember,
    organizationService
} from '../../services/organizationService';

interface DistributorHistoryViewProps {
  organizationId: string;
  doorsAvailable: number;
  doorsDistributed: number;
  onRefresh?: () => void;
}

export default function DistributorHistoryView({
  organizationId,
  doorsAvailable,
  doorsDistributed,
  onRefresh
}: DistributorHistoryViewProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<OrganizationMember[]>([]);
  const [history, setHistory] = useState<DoorDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [doorsToSend, setDoorsToSend] = useState('1');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [organizationId]);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers([]); // Show no users by default
    } else {
      const filtered = members.filter(member => {
        const fullName = member.first_name && member.last_name 
          ? `${member.first_name} ${member.last_name}`.toLowerCase()
          : '';
        const email = member.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query);
      }).slice(0, 5); // Limit to 5 results
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [allUsersResult, historyResult] = await Promise.all([
        organizationService.getAllUsers(),
        organizationService.getDistributorHistory(user.id)
      ]);

      if (allUsersResult.data) {
        setMembers(allUsersResult.data);
        setFilteredMembers(allUsersResult.data);
      }
      if (historyResult.data) {
        setHistory(historyResult.data);
      }
    } catch (error) {
      console.error('Error loading distributor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDoors = async () => {
    if (!user?.id || !selectedMember) return;

    const doorsNum = parseInt(doorsToSend);
    if (isNaN(doorsNum) || doorsNum < 1) {
      Alert.alert('Error', 'Please enter a valid number of doors');
      return;
    }

    if (doorsNum > doorsAvailable) {
      Alert.alert('Error', `You only have ${doorsAvailable} doors available`);
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for sending doors');
      return;
    }

    setSending(true);
    try {
      const result = await organizationService.sendDoors(
        user.id,
        selectedMember.id,
        doorsNum,
        reason
      );

      if (result.success) {
        Alert.alert('Success', `Sent ${doorsNum} door${doorsNum > 1 ? 's' : ''} to ${selectedMember.first_name || selectedMember.email}`);
        setShowSendModal(false);
        setSelectedMember(null);
        setDoorsToSend('1');
        setReason('');
        loadData();
        onRefresh?.();
      } else {
        Alert.alert('Error', result.error || 'Failed to send doors');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send doors');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#009688" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Distributor Stats */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          Your Door Allowance
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#E6FFFA',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#009688' }}>
              {doorsAvailable}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Available</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#6B7280' }}>
              {doorsDistributed}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Distributed</Text>
          </View>
        </View>
      </View>

      {/* Send Doors Section */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          Send Doors to Users
        </Text>
        
        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB'
        }}>
          <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 12 }} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: '#111827'
            }}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            {searchQuery ? 'No users found matching your search' : 'Start typing to search for users...'}
          </Text>
        ) : (
          filteredMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F3F4F6'
              }}
              onPress={() => {
                setSelectedMember(member);
                setShowSendModal(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                  {member.first_name && member.last_name
                    ? `${member.first_name} ${member.last_name}`
                    : member.email}
                </Text>
                {member.first_name && member.last_name && (
                  <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                    {member.email}
                  </Text>
                )}
              </View>
              <Ionicons name="arrow-forward-circle" size={24} color="#009688" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Distribution History */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 100 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          Distribution History
        </Text>
        {history.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            No distributions yet
          </Text>
        ) : (
          history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((dist) => (
            <View
              key={dist.id}
              style={{
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F3F4F6'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                  {dist.recipient_name}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#009688' }}>
                  +{dist.doors_sent} door{dist.doors_sent > 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                {dist.reason}
              </Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                {new Date(dist.created_at).toLocaleDateString()} at {new Date(dist.created_at).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Send Doors Modal */}
      <Modal
        visible={showSendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827' }}>
                Send Doors
              </Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                  Sending to: <Text style={{ fontWeight: '600', color: '#111827' }}>
                    {selectedMember.first_name && selectedMember.last_name
                      ? `${selectedMember.first_name} ${selectedMember.last_name}`
                      : selectedMember.email}
                  </Text>
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Number of Doors
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    marginBottom: 16
                  }}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={doorsToSend}
                  onChangeText={setDoorsToSend}
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Reason
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    marginBottom: 20,
                    minHeight: 80,
                    textAlignVertical: 'top'
                  }}
                  placeholder="e.g., Great work on the presentation"
                  multiline
                  numberOfLines={3}
                  value={reason}
                  onChangeText={setReason}
                />

                <TouchableOpacity
                  style={{
                    backgroundColor: '#009688',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                  onPress={handleSendDoors}
                  disabled={sending}
                >
                  {sending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Send Doors
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

