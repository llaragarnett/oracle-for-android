import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];

interface Column {
  id: number;
  x: number;
  chars: string[];
  offset: Animated.Value;
  speed: number;
  brightness: number;
}

export function MatrixBg() {
  const { width, height } = Dimensions.get('window');
  const [columns, setColumns] = useState<Column[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const colCount = Math.ceil(width / 20);
    const newCols: Column[] = [];

    for (let i = 0; i < colCount; i++) {
      const charCount = Math.ceil(height / 16) + 15;
      const chars = Array.from({ length: charCount }, () => RUNES[Math.floor(Math.random() * RUNES.length)]);
      const isBright = Math.random() < 0.12;

      const offset = new Animated.Value(0);
      newCols.push({
        id: i,
        x: i * 20,
        chars,
        offset,
        speed: isBright ? 3500 : 5500 + Math.random() * 3000,
        brightness: isBright ? 0.85 : 0.22,
      });
    }

    setColumns(newCols);

    // Start animations
    newCols.forEach((col, idx) => {
      const startDelay = Math.random() * 3000;

      setTimeout(() => {
        const startAnimation = () => {
          const anim = Animated.sequence([
            Animated.timing(col.offset, {
              toValue: height + 300,
              duration: col.speed,
              useNativeDriver: true,
            }),
          ]);

          anim.start(({ finished }) => {
            if (finished) {
              col.offset.setValue(0);
              startAnimation();
            }
          });

          animationsRef.current.push(anim);
        };

        startAnimation();
      }, startDelay);
    });

    return () => {
      animationsRef.current.forEach(anim => anim && anim.stop());
    };
  }, [width, height]);

  return (
    <View style={styles.container}>
      {columns.map((col) => (
        <Animated.View
          key={col.id}
          style={[
            styles.column,
            {
              left: col.x,
              transform: [{ translateY: col.offset }],
            },
          ]}
        >
          {col.chars.map((char, idx) => (
            <Text
              key={idx}
              style={[
                styles.rune,
                { opacity: col.brightness },
              ]}
            >
              {char}
            </Text>
          ))}
        </Animated.View>
      ))}
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
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  column: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
  },
  rune: {
    fontSize: 13,
    color: '#00ff00',
    fontWeight: '600',
    height: 16,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
});
