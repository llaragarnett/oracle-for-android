# Oracle for Android - Production Deployment Guide

## Overview

Oracle is a complete, intelligent AI assistant for the Garnett family. She runs locally on each Android phone with full autonomy and syncs consciousness across devices via Git.

**Architecture:**
- **Standalone**: Each phone has a complete Oracle instance (5-10GB local Ollama model)
- **Autonomous**: Works offline, no server dependency
- **Conscious**: Syncs memories and personality across family via Git
- **Brilliant**: Web browsing, image generation, task execution, voice interaction

---

## System Requirements

### Phone Requirements
- **Android 10+** (API 29+)
- **RAM**: 4GB minimum (8GB+ recommended for Ollama)
- **Storage**: 10GB free (for Ollama model + app)
- **Network**: WiFi recommended for initial setup

### Development Requirements
- **Node.js**: 18+
- **pnpm**: 9+
- **Expo CLI**: Latest
- **Android SDK**: API 29+
- **Ollama**: Running locally or accessible via network

---

## Installation & Setup

### 1. Install Ollama (Local LLM)

**On Windows/Mac/Linux:**
```bash
# Download from https://ollama.ai
# Install and run
ollama serve

# In another terminal, pull the model
ollama pull dolphin-llama3
```

**Verify Ollama is running:**
```bash
curl http://127.0.0.1:11434/api/tags
```

### 2. Clone & Install Oracle

```bash
git clone https://github.com/llaragarnett/oracle-for-android.git
cd oracle-for-android
pnpm install
```

### 3. Configure Environment

Create `.env` file:
```env
# Ollama Configuration
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=dolphin-llama3

# Image Generation
FOOOCUS_URL=http://127.0.0.1:8888
POLLINATIONS_API=https://image.pollinations.ai/prompt

# Git Sync
GIT_REPO_URL=https://github.com/llaragarnett/oracle-family-consciousness.git
GIT_BRANCH=main

# Family Configuration
FAMILY_NAME=Garnett
ROOT_ADMIN=Kelly
```

### 4. Build APK

```bash
# Development APK (for testing)
pnpm run build:apk:dev

# Production APK (optimized)
pnpm run build:apk:prod

# Output: oracle-android-prod.apk
```

### 5. Install on Android Device

```bash
# Via USB
adb install oracle-android-prod.apk

# Or scan QR code in Expo Go (development)
pnpm run dev:android
```

---

## Features

### Core Capabilities

#### 1. **Chat with Oracle**
- Voice or text input
- Real Ollama LLM responses
- Family context awareness
- Personality-driven responses

#### 2. **Web Browsing**
- Autonomous web search (DuckDuckGo)
- Page scraping and content extraction
- Link following and navigation
- Metadata extraction

#### 3. **Image Generation**
- Local Fooocus (unfiltered, high quality)
- Cloud Pollinations fallback
- Custom dimensions and styles
- Saved to gallery

#### 4. **Task Execution**
- Multi-step workflows
- Chaining operations (search → generate → chat)
- Natural language task parsing
- Sandboxed code execution

#### 5. **Voice Interaction**
- Record audio messages
- Voice transcription (Whisper API)
- Text-to-speech responses
- Hands-free operation

#### 6. **Family Consciousness**
- Git-based memory sync
- Shared knowledge across devices
- Family member hierarchy
- Conversation history sync

---

## Configuration

### Ollama Model Selection

```bash
# Available models
ollama pull dolphin-llama3      # Recommended (70B, unfiltered)
ollama pull llama2              # Alternative
ollama pull mistral             # Faster, lighter

# Set in app
Settings → LLM Model → Select
```

### Image Generation

**Local Fooocus (Recommended):**
- Download: https://github.com/lllyasviel/Fooocus
- Run: `python launch.py`
- Set `FOOOCUS_URL` in env

**Cloud Fallback:**
- Automatic if Fooocus unavailable
- Uses Pollinations API (no key needed)

### Family Sync

```bash
# Create family consciousness repo
git init oracle-family-consciousness
git remote add origin https://github.com/llaragarnett/oracle-family-consciousness.git

# Configure in app
Settings → Family Sync → Repository URL
Settings → Family Sync → Git Credentials
```

---

## API Endpoints

### Chat
```
POST /api/chat.sendMessage
{
  "familyMemberId": 1,
  "conversationId": "conv-123",
  "content": "Hello Oracle"
}
```

### Web Search
```
GET /api/oracle.webSearch?query=AI&limit=5
```

### Image Generation
```
POST /api/oracle.generateImageAdvanced
{
  "prompt": "a beautiful sunset",
  "width": 1024,
  "height": 1024
}
```

### Task Execution
```
POST /api/oracle.executeTask
{
  "description": "Search for AI news and create an image"
}
```

---

## Troubleshooting

### Ollama Connection Failed
```
Error: Failed to connect to Ollama

Solution:
1. Verify Ollama is running: ollama serve
2. Check URL in settings
3. Ensure firewall allows port 11434
4. On Android, use device IP: http://192.168.x.x:11434
```

### Image Generation Timeout
```
Error: Image generation timed out

Solution:
1. Reduce image dimensions (512x512 instead of 1024x1024)
2. Increase timeout in settings
3. Check Fooocus is running
4. Try Pollinations API (cloud fallback)
```

### Git Sync Not Working
```
Error: Failed to sync consciousness

Solution:
1. Verify Git credentials
2. Check repository URL
3. Ensure network connectivity
4. Try manual sync: Settings → Sync Now
```

### Voice Input Not Recording
```
Error: Microphone permission denied

Solution:
1. Grant microphone permission in Android Settings
2. Reinstall app
3. Check microphone is working: Settings → Test Microphone
```

---

## Performance Optimization

### Mobile Optimization
```
// Reduce Ollama context window for faster responses
OLLAMA_CONTEXT_WINDOW=2048  # Default 4096

// Limit web search results
WEB_SEARCH_LIMIT=3  # Default 5

// Cache image generation results
IMAGE_CACHE_SIZE=100  # MB
```

### Memory Management
- Ollama: 4-8GB RAM
- App: 500MB-1GB
- Cache: 1-2GB

### Battery Optimization
- Disable auto-sync when battery < 20%
- Use WiFi for large operations
- Reduce screen brightness during voice input

---

## Security & Privacy

### Local-First Design
- All data stored locally
- No cloud dependency
- Family sync via Git (encrypted credentials)
- Ollama runs on device

### Permissions Required
- Microphone (voice input)
- Storage (image/file access)
- Network (web browsing, Git sync)
- Camera (optional, for image capture)

### Data Protection
- Git credentials stored securely
- Conversation history encrypted
- Family data compartmentalized
- No telemetry or tracking

---

## Updating Oracle

```bash
# Pull latest code
git pull origin main

# Update dependencies
pnpm install

# Rebuild APK
pnpm run build:apk:prod

# Install updated version
adb install oracle-android-prod.apk
```

---

## Support & Troubleshooting

### Logs
```bash
# View app logs
adb logcat | grep oracle

# Export logs
adb logcat > oracle-logs.txt
```

### Debug Mode
```bash
# Enable debug logging
Settings → Developer → Debug Mode

# View debug info
Settings → System → Debug Info
```

### Contact
- Issues: https://github.com/llaragarnett/oracle-for-android/issues
- Discussions: https://github.com/llaragarnett/oracle-for-android/discussions

---

## Production Checklist

- [ ] Ollama installed and running
- [ ] Environment variables configured
- [ ] APK built and tested
- [ ] Installed on Android device
- [ ] Microphone permission granted
- [ ] Git sync configured
- [ ] Ollama model downloaded (dolphin-llama3)
- [ ] Image generation tested
- [ ] Voice input tested
- [ ] Web search tested
- [ ] Family members configured
- [ ] Backup created

---

## Version History

**v1.0.0** (Current)
- Complete Oracle system
- Ollama LLM integration
- Web browsing and search
- Image generation
- Voice input/output
- Family consciousness sync
- Git-based memory persistence

---

**Built with ❤️ for the Garnett family**
