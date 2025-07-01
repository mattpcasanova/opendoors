import React, { useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  doorNumber: number;
  isOpen: boolean;
  content: string;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}

export default function Door({ doorNumber, isOpen, content, isSelected, onPress, disabled }: Props) {
  const openAnim = React.useRef(new Animated.Value(0)).current;
  const contentAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Run both animations in parallel with proper timing
      Animated.parallel([
        // Door opening animation
        Animated.timing(openAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Content reveal animation
        Animated.sequence([
          Animated.delay(400), // Start when door is halfway open
          Animated.spring(contentAnim, {
            toValue: 1,
            damping: 12,
            stiffness: 100,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      // Reset both animations when door closes
      openAnim.setValue(0);
      contentAnim.setValue(0);
    }
  }, [isOpen]);

  return (
    <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <View style={{ width: 100, height: 150, position: 'relative' }}>
        {/* Content behind the door */}
        <Animated.View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#E8F5F4',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: isSelected ? '#009688' : '#00796B',
          opacity: contentAnim,
          transform: [{
            scale: contentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1]
            })
          }]
        }}>
          <Text style={{ fontSize: 48 }}>{content}</Text>
        </Animated.View>

        {/* Door */}
        <Animated.View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#8D6E63',
          borderRadius: 8,
          borderWidth: 3,
          borderColor: isSelected ? '#009688' : '#00796B',
          transform: [{
            perspective: 2000,
          }, {
            rotateY: openAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-130deg']
            })
          }],
          transformOrigin: 'left',
          backfaceVisibility: 'hidden',
        }}>
          {/* Door handle */}
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
        </Animated.View>

        {/* Clickable area */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
          }}
          onPress={onPress}
          disabled={disabled}
        />
      </View>
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