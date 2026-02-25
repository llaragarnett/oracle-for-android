import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];

export function MatrixBg() {
  const { width, height } = Dimensions.get('window');
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    const cols = [];
    const colCount = Math.ceil(width / 18);

    for (let i = 0; i < colCount; i++) {
      const chars = Array.from({ length: Math.ceil(height / 14) + 10 }, () => RUNES[Math.floor(Math.random() * RUNES.length)]);
      const isBright = Math.random() < 0.1;
      
      cols.push({
        id: i,
        x: i * 18,
        chars,
        bright: isBright,
        offset: new Animated.Value(-height),
        speed: isBright ? 3000 : 5000 + Math.random() * 3000,
      });
    }

    setColumns(cols);

    // Start animations
    cols.forEach((col) => {
      const delay = Math.random() * 2000;
      setTimeout(() => {
        const animate = () => {
          Animated.timing(col.offset, {
            toValue: height + 100,
            duration: col.speed,
            useNativeDriver: true,
          }).start(() => {
            col.offset.setValue(-height);
            animate();
          });
        };
        animate();
      }, delay);
    });
  }, [width, height]);

  return (
    <View style={styles.bg}>
      {columns.map((col) => (
        <Animated.View key={col.id} style={[styles.col, { left: col.x, transform: [{ translateY: col.offset }] }]}>
          {col.chars.map((ch: string, i: number) => (
            <Text key={i} style={[styles.rune, col.bright && styles.bright]}>
              {ch}
            </Text>
          ))}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', overflow: 'hidden' },
  col: { position: 'absolute', width: 18 },
  rune: { fontSize: 12, color: '#0f0', opacity: 0.2, height: 14, lineHeight: 14, fontFamily: 'monospace', fontWeight: '600' },
  bright: { opacity: 0.8 },
});
