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
  const doorShakeAnim = React.useRef(new Animated.Value(0)).current;
  const [isOpening, setIsOpening] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsOpening(true);
      // Enhanced door opening sequence
      Animated.sequence([
        // Small shake before opening (reduced intensity)
        Animated.timing(doorShakeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        // Door opening animation with better easing
        Animated.timing(openAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Content reveal with spring animation
        Animated.spring(contentAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 120,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animations when door closes
      openAnim.setValue(0);
      contentAnim.setValue(0);
      doorShakeAnim.setValue(0);
      setIsOpening(false);
    }
  }, [isOpen]);

  // Door shake effect (reduced intensity)
  const shakeRotation = doorShakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-1deg', '1deg', '-0.5deg', '0deg']
  });

  // Enhanced 3D depth effect
  const doorScale = openAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1.08] // Door scales up more as it opens for depth effect
  });

  const doorTranslateX = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8] // Door moves more left as it opens (realistic hinge effect)
  });

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
          opacity: contentAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1] // Start completely hidden, only show when door opens
          }),
          transform: [{
            scale: contentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1]
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
              outputRange: ['0deg', '-110deg']
            })
          }, {
            rotateZ: shakeRotation
          }, {
            scale: doorScale
          }, {
            translateX: doorTranslateX
          }],
          transformOrigin: 'left',
          backfaceVisibility: 'hidden',
          // Enhanced shadow for depth (static values to avoid animation errors)
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 12,
        }}>
          {/* Door handle with better styling - positioned inside the door */}
          <View style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            marginTop: -6,
            width: 12,
            height: 12,
            backgroundColor: '#DAA520', // More realistic gold color
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#B8860B', // Darker gold border
            zIndex: 1,
            // Add handle shadow
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 3,
          }} />
          
          {/* Door panels with better detail - show when door is closed OR opening */}
          {!isOpen || isOpening ? (
            <>
              <View style={{
                position: 'absolute',
                top: 20,
                left: 15,
                right: 15,
                bottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.03)'
              }} />
              
              {/* Additional door detail */}
              <View style={{
                position: 'absolute',
                top: 35,
                left: 20,
                right: 20,
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.15)'
              }} />
            </>
          ) : null}
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