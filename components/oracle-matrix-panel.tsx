import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  timestamp: Date;
}

interface OracleMatrixPanelProps {
  messages: Message[];
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onMicrophone: () => void;
  onVision: () => void;
  isLoading: boolean;
  scrollViewRef: React.RefObject<ScrollView>;
}

export function OracleMatrixPanel({
  messages,
  inputText,
  onInputChange,
  onSendMessage,
  onMicrophone,
  onVision,
  isLoading,
  scrollViewRef,
}: OracleMatrixPanelProps) {
  return (
    <View style={styles.container}>
      {/* Header with rune border */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>◆ ORACLE ◆</Text>
          <Text style={styles.subtitle}>ᚠ Connected to Odin's Wisdom ᚠ</Text>
        </View>
        <View style={styles.headerBorder} />
      </View>

      {/* Messages area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.role === 'user' ? styles.userMessage : styles.oracleMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.oracleBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.oracleText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>⟡ Oracle is thinking ⟡</Text>
          </View>
        )}
      </ScrollView>

      {/* Input area with rune decorations */}
      <View style={styles.inputSection}>
        <View style={styles.inputBorder} />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="ᚠ Speak your question..."
            placeholderTextColor="#00aa00"
            value={inputText}
            onChangeText={onInputChange}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={onSendMessage}
            disabled={isLoading}
            style={[styles.button, styles.sendButton]}
          >
            <MaterialIcons name="send" size={18} color="#00ff00" />
          </TouchableOpacity>
        </View>

        {/* Control buttons */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            onPress={onMicrophone}
            style={[styles.button, styles.controlButton]}
          >
            <MaterialIcons name="mic" size={16} color="#00ff00" />
            <Text style={styles.buttonLabel}>ᚦ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onVision}
            style={[styles.button, styles.controlButton]}
          >
            <MaterialIcons name="visibility" size={16} color="#00ff00" />
            <Text style={styles.buttonLabel}>ᚨ</Text>
          </TouchableOpacity>
          <View style={styles.runeSpacer}>
            <Text style={styles.runeText}>ᛟ ᛗ ᛚ ᛉ</Text>
          </View>
        </View>
      </View>

      {/* Bottom rune border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 340,
    height: 520,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ff00',
    overflow: 'hidden',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    backgroundColor: '#001a00',
    borderBottomWidth: 2,
    borderBottomColor: '#00ff00',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00ff00',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 255, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 11,
    color: '#00aa00',
    marginTop: 4,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#00ff00',
    marginTop: 8,
    opacity: 0.3,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  oracleMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#001a00',
    borderColor: '#00ff00',
  },
  oracleBubble: {
    backgroundColor: '#0d3d0d',
    borderColor: '#00ff00',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  userText: {
    color: '#00ff00',
  },
  oracleText: {
    color: '#00ff00',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 11,
    color: '#00aa00',
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: '#001a00',
    borderTopWidth: 2,
    borderTopColor: '#00ff00',
  },
  inputBorder: {
    height: 1,
    backgroundColor: '#00ff00',
    opacity: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'monospace',
    maxHeight: 60,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00ff00',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001a00',
  },
  sendButton: {
    backgroundColor: '#002200',
  },
  controlRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
  },
  buttonLabel: {
    fontSize: 10,
    color: '#00ff00',
    fontFamily: 'monospace',
  },
  runeSpacer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  runeText: {
    fontSize: 10,
    color: '#00aa00',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#00ff00',
    opacity: 0.3,
  },
});
