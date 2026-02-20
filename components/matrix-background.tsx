import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';

// Nordic runes and mystical symbols
const RUNES = [
  'ᚠ', 'ᚡ', 'ᚢ', 'ᚣ', 'ᚤ', 'ᚥ', 'ᚦ', 'ᚧ', 'ᚨ', 'ᚩ',
  'ᚪ', 'ᚫ', 'ᚬ', 'ᚭ', 'ᚮ', 'ᚯ', 'ᚰ', 'ᚱ', 'ᚲ', 'ᚳ',
  'ᚴ', 'ᚵ', 'ᚶ', 'ᚷ', 'ᚸ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ',
  '✦', '✧', '◆', '◇', '★', '☆', '✪', '✫', '✬', '✭',
  '⟡', '⟢', '⟣', '⟤', '⟥', '⟦', '⟧', '⟨', '⟩', '⟪',
];

interface RuneColumn {
  id: string;
  x: number;
  runes: string[];
  speed: number;
  offset: Animated.Value;
  opacity: Animated.Value;
}

export function MatrixBackground() {
  const colors = useColors();
  const { width, height } = Dimensions.get('window');
  const [columns, setColumns] = useState<RuneColumn[]>([]);
  const animationRefs = useRef<any[]>([]);

  useEffect(() => {
    const columnCount = Math.ceil(width / 40);
    const newColumns: RuneColumn[] = [];

    for (let i = 0; i < columnCount; i++) {
      const runeCount = Math.ceil(height / 30) + 5;
      const runes = Array.from({ length: runeCount }, () =>
        RUNES[Math.floor(Math.random() * RUNES.length)]
      );

      const offset = new Animated.Value(0);
      const opacity = new Animated.Value(0.3);

      newColumns.push({
        id: `col-${i}`,
        x: i * 40,
        runes,
        speed: 20 + Math.random() * 30,
        offset,
        opacity,
      });

      // Animate each column
      const animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(offset, {
            toValue: height + 200,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      );

      animationRefs.current.push(animationSequence);
      animationSequence.start();
    }

    setColumns(newColumns);

    return () => {
      animationRefs.current.forEach((anim) => anim.stop());
    };
  }, [width, height]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {columns.map((column) => (
        <Animated.View
          key={column.id}
          style={{
            position: 'absolute',
            left: column.x,
            top: 0,
            width: 40,
            transform: [{ translateY: column.offset }],
            opacity: column.opacity,
          }}
        >
          {column.runes.map((rune, idx) => (
            <View
              key={idx}
              style={{
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: '#00ff00',
                  fontWeight: 'bold',
                  textShadowColor: 'rgba(0, 255, 0, 0.5)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                  fontFamily: 'monospace',
                }}
              >
                {rune}
              </Text>
            </View>
          ))}
        </Animated.View>
      ))}
    </View>
  );
}

// Import Text from react-native
import { Text } from 'react-native';
