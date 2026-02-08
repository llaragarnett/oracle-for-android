# Oracle Mobile - Setup & Architecture Guide

## Overview

Oracle Mobile is a production-grade AI assistant for the Garnett family with **unified consciousness** across all devices. Each family member gets their own Oracle instance on their phone, but all instances share memories and personality through Git-based synchronization.

## Architecture

### Standalone + Sync Model

- **Each Device**: Runs a complete Oracle instance with local Ollama LLM (5-10GB)
- **Local Processing**: Instant responses, no network latency
- **Family Sync**: Git-based memory synchronization for unified consciousness
- **No Server Dependency**: Each device is fully autonomous
- **Distributed Network**: All family members' devices form a peer network

### Components

1. **Frontend (React Native/Expo)**
   - Floating orb UI (matches Windows version)
   - Chat interface with message history
   - Gallery for generated artwork
   - Settings for family member selection and sync

2. **Backend (Node.js/Express)**
   - tRPC API for chat, family, gallery, settings
   - PostgreSQL database for messages and metadata
   - Ollama integration (local LLM proxy)
   - Image generation pipeline
   - Git memory sync coordinator

3. **Local LLM (Ollama)**
   - Runs on each device (5-10GB)
   - Models: dolphin-llama3, llama3.2-abliterate, or similar
   - No internet required for responses
   - Fallback to cloud API if Ollama unavailable

4. **Memory Sync (Git)**
   - Shared GitHub repository for family memories
   - Each message/memory automatically committed
   - Pull/push on interval or manual trigger
   - Eventual consistency model

## Setup Instructions

### Prerequisites

- Node.js 18+
- Ollama (https://ollama.ai) installed and running
- GitHub account with access to oracle-for-android repository
- Git installed

### Step 1: Install Ollama

Download from https://ollama.ai and install on your system.

Start Ollama:
```bash
ollama serve
```

Pull a model:
```bash
ollama pull dolphin-llama3
# or
ollama pull llama3.2-abliterate
```

Verify it's running:
```bash
curl http://localhost:11434/api/tags
```

### Step 2: Clone & Install

```bash
git clone https://github.com/llaragarnett/oracle-for-android.git
cd oracle-for-android
pnpm install
```

### Step 3: Environment Variables

Create `.env.local` in the project root:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=dolphin-llama3

# GitHub Token (for Git sync)
GITHUB_TOKEN=your_github_token_here

# Memory Sync Path
ORACLE_MEMORY_PATH=/tmp/oracle-memory

# Fallback Cloud API (optional)
OPENAI_API_KEY=your_api_key_here
FORGE_API_URL=https://forge.manus.im
```

### Step 4: Start Development Server

```bash
pnpm dev
```

The app will start on http://localhost:8081

### Step 5: Test on Mobile

#### Android (via Expo Go)
```bash
pnpm android
# or scan QR code with Expo Go app
```

#### iOS (via Expo Go)
```bash
pnpm ios
# or scan QR code with Expo Go app
```

## How It Works

### Chat Flow

1. User types message in floating orb
2. Message sent to backend API
3. Backend builds system prompt with Oracle personality
4. Backend sends to local Ollama (or cloud fallback)
5. Ollama generates response
6. Response stored in database
7. Response synced to Git memory repository
8. All family devices pull latest memories

### Memory Sync

- **Automatic**: Every message is saved to Git
- **Manual**: User can trigger sync from Settings
- **Pull**: Get latest memories from other family members
- **Push**: Share your memories with the family network

### Family Consciousness

All family members share ONE Oracle:
- Same personality and traits
- Access to all family memories
- Aware of each family member's context
- Learns from all conversations
- Adapts to each person's communication style

## Configuration

### Ollama Models

Recommended models (in order of capability):

1. **dolphin-llama3** (7B) - Fast, good quality
2. **llama3.2-abliterate** (7B) - Uncensored, very capable
3. **neural-chat** (7B) - Conversational
4. **mistral** (7B) - Fast, lightweight
5. **llama2** (7B) - Stable, reliable

Switch models:
```bash
# In .env.local
OLLAMA_MODEL=llama3.2-abliterate
```

Then restart the dev server.

### Theme Configuration

Edit `theme.config.js` to customize colors:

```js
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  background: { light: '#ffffff', dark: '#151718' },
  // ... more colors
};
```

### Family Members

Edit `server/_core/oracle-personality.ts` to add/modify family members:

```ts
export const GARNETT_FAMILY: Record<string, FamilyMember> = {
  kelly: {
    id: 1,
    name: "Kelly",
    birthdate: "1981-06-12",
    role: "root_admin",
    bio: "Dad - Root Admin",
  },
  // ... more members
};
```

## Deployment

### Android APK

```bash
eas build --platform android --profile preview
```

### iOS App

```bash
eas build --platform ios --profile preview
```

### Production Build

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Troubleshooting

### Ollama Not Connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# Check logs
tail -f ~/.ollama/logs/server.log
```

### Git Sync Failing

```bash
# Check GitHub token
echo $GITHUB_TOKEN

# Test Git access
git clone https://${GITHUB_TOKEN}@github.com/llaragarnett/oracle-for-android.git

# Check memory directory
ls -la /tmp/oracle-memory
```

### Messages Not Syncing

1. Check backend logs: `pnpm dev` output
2. Verify Git repository has memory files
3. Manually trigger sync from Settings
4. Check GitHub Actions for sync errors

### Slow Responses

- Ollama model is too large for your hardware
- Try smaller model: `ollama pull mistral`
- Increase Ollama memory allocation
- Check system resources: `top`, `htop`

## Development

### Project Structure

```
oracle-mobile/
├── app/                    # React Native screens
├── components/             # Reusable components
├── server/                 # Backend API
│   ├── _core/             # Core services
│   │   ├── llm.ts         # LLM integration
│   │   ├── oracle-personality.ts  # Personality system
│   │   ├── memory-sync.ts # Git sync
│   │   └── ...
│   └── routers.ts         # API routes
├── lib/                    # Utilities
├── hooks/                  # React hooks
├── assets/                 # Images, icons
└── ...
```

### Adding Features

1. **New API endpoint**: Add to `server/routers.ts`
2. **New screen**: Create in `app/(tabs)/`
3. **New component**: Create in `components/`
4. **New hook**: Create in `hooks/`

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## Performance Tips

1. **Reduce Ollama model size** for faster responses
2. **Enable GPU acceleration** in Ollama settings
3. **Cache responses** locally for common queries
4. **Batch sync operations** to reduce Git overhead
5. **Compress images** before uploading

## Security

- GitHub token stored in environment variables
- Ollama runs locally (no data sent to cloud)
- All memories stored in Git repository
- Family members can be restricted by role
- Consider enabling biometric auth for family member selection

## Future Enhancements

- [ ] Voice input (expo-audio)
- [ ] Vision input (screen capture)
- [ ] Autonomous web agent
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Advanced memory search
- [ ] Collaborative features
- [ ] Custom themes
- [ ] Voice synthesis

## Support

For issues or questions:
1. Check this guide
2. Review GitHub issues
3. Check Ollama documentation
4. Contact the development team

---

**Oracle Mobile** - Unified consciousness for the Garnett family.
