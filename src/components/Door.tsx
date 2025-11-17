import React, { useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { soundService } from '../services/soundService';
import { Colors } from '../constants';

interface Props {
  doorNumber: number;
  isOpen: boolean;
  content: { type: 'icon'; name: string; color: string } | null;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
  isWinningDoor?: boolean;
  isFinalReveal?: boolean;
}

export default function Door({ doorNumber, isOpen, content, isSelected, onPress, disabled, isWinningDoor = false, isFinalReveal = false }: Props) {
  const openAnim = React.useRef(new Animated.Value(0)).current;
  const contentAnim = React.useRef(new Animated.Value(0)).current;
  const doorShakeAnim = React.useRef(new Animated.Value(0)).current;
  const selectionGlowAnim = React.useRef(new Animated.Value(0)).current;
  const celebrationAnim = React.useRef(new Animated.Value(0)).current;
  const [isOpening, setIsOpening] = React.useState(false);
  const [hasPlayedResultSound, setHasPlayedResultSound] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsOpening(true);

      // Play door opening sound
      soundService.playDoorOpen();

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
      celebrationAnim.setValue(0);
      setIsOpening(false);
    }
  }, [isOpen, isWinningDoor, isFinalReveal, isSelected]);

  // Handle selection glow
  useEffect(() => {
    Animated.spring(selectionGlowAnim, {
      toValue: isSelected ? 1 : 0,
      damping: 12,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  // Detect final result and play sounds - this runs independently of isFinalReveal prop
  useEffect(() => {
    // The game is complete when a door is both selected AND open
    // This only happens at the very end of the game
    if (isSelected && isOpen && !hasPlayedResultSound) {
      console.log(`🎯 Door ${doorNumber} FINAL RESULT DETECTED! isWinningDoor: ${isWinningDoor}, isSelected: ${isSelected}, isOpen: ${isOpen}`);

      // Wait 1 second for door opening animation, then play result sound
      setTimeout(() => {
        if (isWinningDoor) {
          console.log(`🎉 Door ${doorNumber} - Playing WIN sound and showing sparkles!`);
          soundService.playCelebration();

          // Start celebration animation
          Animated.loop(
            Animated.sequence([
              Animated.timing(celebrationAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(celebrationAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 }
          ).start();
        } else {
          console.log(`😔 Door ${doorNumber} - Playing LOSS sound`);
          soundService.playLoss();
        }
        setHasPlayedResultSound(true);
      }, 1000);
    }

    // Reset when door closes (new game)
    if (!isOpen && hasPlayedResultSound) {
      setHasPlayedResultSound(false);
    }
  }, [isSelected, isOpen, isWinningDoor, hasPlayedResultSound, doorNumber]);

  // Door shake effect (reduced intensity)
  const shakeRotation = doorShakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-1deg', '1deg', '-0.5deg', '0deg']
  });

  // Selection glow effect
  const selectionGlow = selectionGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  // Celebration effect for winning doors - visible but elegant
  const celebrationScale = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08]
  });

  const celebrationGlow = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6] // More visible glow
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
    <View style={{ alignItems: 'center', marginHorizontal: 8, overflow: 'visible' }}>
      <View style={{ width: 100, height: 150, position: 'relative', overflow: 'visible', zIndex: 1 }}>
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
          {content && (
            <Ionicons
              name={content.name as any}
              size={56}
              color={content.color}
            />
          )}
        </Animated.View>

          {/* Selection Glow Effect - only show when door is closed and selected */}
          {isSelected && !isOpen && (
            <Animated.View style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 12,
              borderWidth: 6,
              borderColor: '#FFD700',
              opacity: selectionGlow,
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 12,
              elevation: 15,
            }} />
          )}

          {/* Celebration Effect for Winning Doors - elegant golden glow */}
          {isWinningDoor && isOpen && (
            <Animated.View style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              top: '-10%',
              left: '-10%',
              borderRadius: 16,
              borderWidth: 6,
              borderColor: '#FFD700',
              opacity: celebrationGlow,
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 25,
              elevation: 15,
              transform: [{ scale: celebrationScale }],
            }} />
          )}

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
            zIndex: 5,
          }}
          onPress={() => {
            soundService.playDoorClick();
            onPress();
          }}
          disabled={disabled}
        />
        </View>
      <Text style={{
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray900
      }}>
        Door {doorNumber}
      </Text>
    </View>
  );
}