import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { Text } from 'react-native';

// Elder Futhark Runes - The authentic ancient Norse alphabet
const ELDER_FUTHARK = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
  'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ',
  'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ',
];

interface RuneColumn {
  id: string;
  x: number;
  runes: string[];
  speed: number;
  isBright: boolean;
  offset: Animated.Value;
}

export function OdinMatrixBackground() {
  const { width, height } = Dimensions.get('window');
  const [columns, setColumns] = useState<RuneColumn[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const columnCountRef = useRef(0);

  useEffect(() => {
    // Create many columns with smaller characters
    const columnCount = Math.ceil(width / 20); // More columns, closer together
    columnCountRef.current = columnCount;
    const newColumns: RuneColumn[] = [];

    for (let i = 0; i < columnCount; i++) {
      const runeCount = Math.ceil(height / 16) + 20; // More runes per column
      const runes = Array.from({ length: runeCount }, () =>
        ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)]
      );

      const offset = new Animated.Value(0);
      const isBright = Math.random() < 0.15; // 15% chance to be bright
      const speed = isBright ? 4000 + Math.random() * 2000 : 6000 + Math.random() * 4000;

      newColumns.push({
        id: `col-${i}`,
        x: i * 20,
        runes,
        speed,
        isBright,
        offset,
      });
    }

    setColumns(newColumns);

    // Start animations for each column
    newColumns.forEach((column, index) => {
      const startDelay = Math.random() * 3000; // Random start delay

      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(column.offset, {
            toValue: height + 200,
            duration: column.speed,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      );

      animationsRef.current.push(animation);
      animation.start();
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.stop());
    };
  }, [width, height]);

  return (
    <View style={styles.container}>
      {/* Rune columns - continuous falling */}
      {columns.map((column) => (
        <Animated.View
          key={column.id}
          style={[
            styles.column,
            {
              left: column.x,
              transform: [{ translateY: column.offset }],
            },
          ]}
        >
          {column.runes.map((rune, idx) => (
            <View
              key={idx}
              style={[
                styles.runeCell,
                column.isBright && styles.brightRune,
              ]}
            >
              <Text
                style={[
                  styles.rune,
                  column.isBright && styles.brightRuneText,
                ]}
              >
                {rune}
              </Text>
            </View>
          ))}
        </Animated.View>
      ))}

      {/* Subtle glow overlay */}
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
  column: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
  },
  runeCell: {
    height: 16,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rune: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ff00',
    opacity: 0.25, // Faded by default
    textShadowColor: 'rgba(0, 255, 0, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
    letterSpacing: 0,
  },
  brightRune: {
    // Bright column styling
  },
  brightRuneText: {
    opacity: 0.9, // Much brighter
    color: '#00ff00',
    textShadowColor: 'rgba(0, 255, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontWeight: '700',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.01)',
    pointerEvents: 'none',
  },
});
