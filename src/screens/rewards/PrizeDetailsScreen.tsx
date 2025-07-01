import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootNavigationProp, RootStackParamList } from '../../types/navigation';

export default function PrizeDetailsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PrizeDetails'>>();
  const reward = route.params.reward;

  if (!reward) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: '#374151' }}>No reward details available</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 16,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#111827',
          marginLeft: 8,
          flex: 1,
        }}>
          Reward Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* QR Code and Reward Code Section */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{
            width: 192,
            height: 192,
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            padding: 16,
          }}>
            <QRCode
              value={reward.rewardCode || reward.id}
              size={160}
              backgroundColor="white"
              color="#111827"
            />
          </View>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            Reward Code
          </Text>
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            {reward.rewardCode || 'N/A'}
          </Text>
        </View>

        {/* Company Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#F3F4F6',
              marginRight: 16,
            }}>
              {reward.logo_url ? (
                <Image
                  source={{ uri: reward.logo_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 24, textAlign: 'center', lineHeight: 48 }}>
                  {reward.icon}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                {reward.company}
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4 }}>
                {reward.reward}
              </Text>
            </View>
          </View>
        </View>

        {/* Expiration Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={20} color="#EA580C" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
                Expiration
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4 }}>
                {new Date(reward.expirationDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        {reward.instructions && reward.instructions.length > 0 && (
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
              Redemption Instructions
            </Text>
            {reward.instructions.map((instruction, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ color: '#6B7280', marginRight: 8 }}>•</Text>
                <Text style={{ flex: 1, color: '#6B7280' }}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}