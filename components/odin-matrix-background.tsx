import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

// Elder Futhark Runes - The authentic ancient Norse alphabet
const ELDER_FUTHARK = [
  'ᚠ', // Fehu - Wealth, cattle
  'ᚢ', // Uruz - Strength, wild ox
  'ᚦ', // Thurisaz - Giant, thorn
  'ᚨ', // Ansuz - God, ancestor
  'ᚱ', // Raido - Journey, wagon
  'ᚲ', // Kenaz - Torch, knowledge
  'ᚷ', // Gebo - Gift, generosity
  'ᚹ', // Wunjo - Joy, bliss
  'ᚺ', // Hagalaz - Hail, disruption
  'ᚾ', // Nauthiz - Need, necessity
  'ᛁ', // Isa - Ice, standstill
  'ᛃ', // Jera - Year, harvest
  'ᛇ', // Eihwaz - Yew tree, defense
  'ᛈ', // Perthro - Dice cup, secrets
  'ᛉ', // Algiz - Elk, protection
  'ᛊ', // Sowilo - Sun, wholeness
  'ᛏ', // Tiwaz - Warrior, sky god
  'ᛒ', // Berkano - Birch, growth
  'ᛖ', // Ehwaz - Horse, movement
  'ᛗ', // Mannaz - Man, self
  'ᛚ', // Laguz - Water, flow
  'ᛜ', // Ingwaz - Ing, fertility
  'ᛟ', // Othala - Homeland, inheritance
  'ᛞ', // Dagaz - Day, breakthrough
];

interface RuneStream {
  id: string;
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  runes: string[];
  speed: number;
  delay: number;
}

export function OdinMatrixBackground() {
  const { width, height } = Dimensions.get('window');
  const [streams, setStreams] = useState<RuneStream[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Create multiple rune streams
    const streamCount = Math.ceil(width / 50);
    const newStreams: RuneStream[] = [];

    for (let i = 0; i < streamCount; i++) {
      const runeCount = Math.ceil(height / 35) + 10;
      const runes = Array.from({ length: runeCount }, () =>
        ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)]
      );

      const y = new Animated.Value(-height);
      const opacity = new Animated.Value(0);
      const speed = 3000 + Math.random() * 4000;
      const delay = Math.random() * 2000;

      newStreams.push({
        id: `stream-${i}`,
        x: (i * width) / streamCount,
        y,
        opacity,
        runes,
        speed,
        delay,
      });

      // Create smooth, continuous animation
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(y, {
              toValue: height + 100,
              duration: speed,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      );

      animationsRef.current.push(animation);
      animation.start();
    }

    setStreams(newStreams);

    return () => {
      animationsRef.current.forEach((anim) => anim.stop());
    };
  }, [width, height]);

  return (
    <View style={styles.container}>
      {/* Deep black background with subtle glow */}
      <View style={styles.background} />

      {/* Rune streams */}
      {streams.map((stream) => (
        <Animated.View
          key={stream.id}
          style={[
            styles.stream,
            {
              left: stream.x,
              transform: [{ translateY: stream.y }],
              opacity: stream.opacity,
            },
          ]}
        >
          {stream.runes.map((rune, idx) => (
            <View key={idx} style={styles.runeContainer}>
              <View style={styles.runeWrapper}>
                <Text style={styles.rune}>{rune}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      ))}

      {/* Glow effect overlay */}
      <View style={styles.glowOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  stream: {
    position: 'absolute',
    width: 50,
    alignItems: 'center',
  },
  runeContainer: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rune: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00ff00',
    textShadowColor: 'rgba(0, 255, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.02)',
    pointerEvents: 'none',
  },
});

// Import Text from react-native
import { Text } from 'react-native';
