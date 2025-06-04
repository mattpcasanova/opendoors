import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  doorNumber: number;
  isOpen: boolean;
  content: string;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}

export default function Door({ doorNumber, isOpen, content, isSelected, onPress, disabled }: Props) {
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <TouchableOpacity
        style={{
          width: 100,
          height: 150,
          backgroundColor: isOpen ? '#E8F5F4' : '#8D6E63',
          borderRadius: 8,
          borderWidth: 3,
          borderColor: isSelected ? '#009688' : '#00796B',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          position: 'relative',
        }}
        onPress={onPress}
        disabled={disabled}
      >
        {isOpen ? (
          <Text style={{ fontSize: 36 }}>{content}</Text>
        ) : (
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Door handle - Fixed positioning */}
            <View style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              marginTop: -6,
              width: 12,
              height: 12,
              backgroundColor: '#FFB74D',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#F57C00',
              zIndex: 1,
            }} />
            
            {/* Door panels */}
            <View style={{
              position: 'absolute',
              top: 20,
              left: 15,
              right: 15,
              bottom: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4
            }} />
          </View>
        )}
      </TouchableOpacity>
      <Text style={{ 
        marginTop: 8, 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#333' 
      }}>
        Door {doorNumber}
      </Text>
    </View>
  );
}