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
import {
    DoorDistribution,
    OrganizationMember,
    organizationService
} from '../../services/organizationService';

interface AdminHistoryViewProps {
  organizationId: string;
}

export default function AdminHistoryView({ organizationId }: AdminHistoryViewProps) {
  const [distributors, setDistributors] = useState<OrganizationMember[]>([]);
  const [distributions, setDistributions] = useState<DoorDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoorsModal, setShowAddDoorsModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<OrganizationMember | null>(null);
  const [doorsToAdd, setDoorsToAdd] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [distributorsResult, distributionsResult] = await Promise.all([
        organizationService.getOrganizationDistributors(organizationId),
        organizationService.getOrganizationDistributions(organizationId)
      ]);

      if (distributorsResult.data) {
        setDistributors(distributorsResult.data);
      }
      if (distributionsResult.data) {
        setDistributions(distributionsResult.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoors = async () => {
    if (!selectedDistributor) return;

    const doorsNum = parseInt(doorsToAdd);
    if (isNaN(doorsNum) || doorsNum < 1) {
      Alert.alert('Error', 'Please enter a valid number of doors');
      return;
    }

    setAdding(true);
    try {
      const result = await organizationService.updateDistributorDoors(
        selectedDistributor.id,
        doorsNum
      );

      if (result.success) {
        Alert.alert('Success', `Added ${doorsNum} door${doorsNum > 1 ? 's' : ''} to ${selectedDistributor.first_name || selectedDistributor.email}`);
        setShowAddDoorsModal(false);
        setSelectedDistributor(null);
        setDoorsToAdd('');
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to add doors');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add doors');
    } finally {
      setAdding(false);
    }
  };

  const getDistributionStats = (distributorId: string) => {
    const distributorDists = distributions.filter(d => d.distributor_id === distributorId);
    const totalSent = distributorDists.reduce((sum, d) => sum + d.doors_sent, 0);
    const uniqueRecipients = new Set(distributorDists.map(d => d.recipient_id)).size;
    return { totalSent, uniqueRecipients };
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
      {/* Organization Stats */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          Organization Overview
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
              {distributors.length}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Distributors</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#6B7280' }}>
              {distributions.length}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Total Distributions</Text>
          </View>
        </View>
      </View>

      {/* Distributors List */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          Manage Distributors
        </Text>
        {distributors.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            No distributors in your organization
          </Text>
        ) : (
          distributors.map((distributor) => {
            const stats = getDistributionStats(distributor.id);
            return (
              <View
                key={distributor.id}
                style={{
                  padding: 16,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  marginBottom: 8
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                      {distributor.first_name && distributor.last_name
                        ? `${distributor.first_name} ${distributor.last_name}`
                        : distributor.email}
                    </Text>
                    {distributor.first_name && distributor.last_name && (
                      <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                        {distributor.email}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#009688',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8
                    }}
                    onPress={() => {
                      setSelectedDistributor(distributor);
                      setShowAddDoorsModal(true);
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      Add Doors
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#009688' }}>
                      {distributor.doors_available}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Available</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#6B7280' }}>
                      {distributor.doors_distributed}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Distributed</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#6B7280' }}>
                      {stats.uniqueRecipients}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Recipients</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* All Distributions */}
      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 100 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          All Distributions
        </Text>
        {distributions.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            No distributions yet
          </Text>
        ) : (
          distributions.map((dist) => (
            <View
              key={dist.id}
              style={{
                padding: 16,
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                marginBottom: 8
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    <Text style={{ fontWeight: '600', color: '#111827' }}>
                      {dist.distributor_name}
                    </Text>
                    {' → '}
                    <Text style={{ fontWeight: '600', color: '#111827' }}>
                      {dist.recipient_name}
                    </Text>
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#009688' }}>
                  +{dist.doors_sent}
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

      {/* Add Doors Modal */}
      <Modal
        visible={showAddDoorsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddDoorsModal(false)}
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
                Add Doors
              </Text>
              <TouchableOpacity onPress={() => setShowAddDoorsModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedDistributor && (
              <>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                  Adding doors to: <Text style={{ fontWeight: '600', color: '#111827' }}>
                    {selectedDistributor.first_name && selectedDistributor.last_name
                      ? `${selectedDistributor.first_name} ${selectedDistributor.last_name}`
                      : selectedDistributor.email}
                  </Text>
                </Text>

                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                  Current balance: <Text style={{ fontWeight: '600', color: '#009688' }}>
                    {selectedDistributor.doors_available} doors
                  </Text>
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Number of Doors to Add
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    marginBottom: 20
                  }}
                  placeholder="e.g., 10"
                  keyboardType="number-pad"
                  value={doorsToAdd}
                  onChangeText={setDoorsToAdd}
                />

                <TouchableOpacity
                  style={{
                    backgroundColor: '#009688',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                  onPress={handleAddDoors}
                  disabled={adding}
                >
                  {adding ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Add Doors
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

