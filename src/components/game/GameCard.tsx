import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export default function GameCard({ icon, title, description, onPress }: Props) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
      onPress={onPress}
    >
      <View style={{
        width: 48,
        height: 48,
        backgroundColor: '#FFF3E0',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {description}
        </Text>
      </View>
      
      <View style={{
        backgroundColor: '#009688',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12
      }}>
        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Play</Text>
      </View>
    </TouchableOpacity>
  );
}