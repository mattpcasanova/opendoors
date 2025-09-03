import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SparkleParticle {
  id: number;
  animatedValue: Animated.Value;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  startDelay: number;
}

interface SparkleEffectProps {
  isActive: boolean;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  size?: number;
}

const SparkleEffect: React.FC<SparkleEffectProps> = ({
  isActive,
  particleCount = 12,
  duration = 1500,
  colors = ['#FFD700', '#FFA500', '#FF8C00'],
  size = 8
}) => {
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive && particles.length === 0) {
      createSparkles();
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive]);

  const createSparkles = () => {
    const newParticles: SparkleParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle: SparkleParticle = {
        id: i,
        animatedValue: new Animated.Value(0),
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.3),
        startDelay: i * 50
      };
      newParticles.push(particle);
    }
    
    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (particlesToAnimate: SparkleParticle[]) => {
    const animations = particlesToAnimate.map((particle, index) => {
      // Random direction and distance
      const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 40;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - Math.random() * 20; // Slight upward bias

      return Animated.sequence([
        Animated.delay(particle.startDelay),
        Animated.parallel([
          // Movement animation
          Animated.timing(particle.x, {
            toValue: endX,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: duration,
            useNativeDriver: true,
          }),
          // Scale animation (grow then shrink)
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
          // Opacity animation (fade out)
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ]);
    });

    animationRef.current = Animated.parallel(animations);
    animationRef.current.start(() => {
      // Clean up particles after animation
      setTimeout(() => {
        setParticles([]);
      }, 100);
    });
  };

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              backgroundColor: colors[index % colors.length],
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default SparkleEffect;