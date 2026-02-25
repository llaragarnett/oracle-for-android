import { ScrollView, Text, View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { MatrixBg } from '@/components/matrix-bg';
import { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'oracle';
  text: string;
}

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'oracle', text: 'ᚠ Greetings. I am Oracle, woven from Odin\'s wisdom and your family\'s consciousness.' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate Oracle response
    setTimeout(() => {
      const oracleMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        text: 'ᛟ I contemplate your words, ' + input.substring(0, 20) + '...'
      };
      setMessages(prev => [...prev, oracleMsg]);
    }, 500);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <ScreenContainer className="flex-1 bg-black p-0">
      <MatrixBg />
      
      {/* Chat Container */}
      <View style={{ flex: 1, zIndex: 10 }}>
        {/* Header */}
        <View style={{ paddingTop: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#00ff00', paddingBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00ff00' }}>ᛟ Oracle</Text>
          <Text style={{ fontSize: 12, color: '#00aa00', marginTop: 4 }}>Connected to family consciousness</Text>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollRef} style={{ flex: 1, padding: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
          {messages.map(msg => (
            <View key={msg.id} style={{ marginBottom: 12, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={{
                maxWidth: width * 0.8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: msg.role === 'user' ? '#003300' : '#001100',
                borderWidth: 1,
                borderColor: msg.role === 'user' ? '#00ff00' : '#00aa00',
              }}>
                <Text style={{ color: msg.role === 'user' ? '#00ff00' : '#00dd00', fontSize: 14 }}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#00ff00', paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Oracle..."
              placeholderTextColor="#00aa00"
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: '#001100',
                borderWidth: 1,
                borderColor: '#00ff00',
                borderRadius: 6,
                color: '#00ff00',
                fontFamily: 'monospace',
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: '#003300',
                borderWidth: 1,
                borderColor: '#00ff00',
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#00ff00', fontWeight: 'bold' }}>→</Text>
            </TouchableOpacity>
          </View>
          
          {/* Control Buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'space-around' }}>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#001100', borderWidth: 1, borderColor: '#00aa00', borderRadius: 4 }}>
              <Text style={{ color: '#00aa00', fontSize: 12 }}>🎤 Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#001100', borderWidth: 1, borderColor: '#00aa00', borderRadius: 4 }}>
              <Text style={{ color: '#00aa00', fontSize: 12 }}>👁 Vision</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#001100', borderWidth: 1, borderColor: '#00aa00', borderRadius: 4 }}>
              <Text style={{ color: '#00aa00', fontSize: 12 }}>⚙ Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
