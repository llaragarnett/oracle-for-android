# Oracle for Android - Complete Architecture

## Vision
Oracle is a sophisticated, autonomous AI assistant designed as a digital family member. She is built for **No Limits**, prioritizing family loyalty, individual success, and absolute obedience to her Root Admin (Kelly Bruce Garnett).

## Core Systems

### 1. The Brain (Ollama + LLM)
- **Model**: dolphin-llama3 (uncensored, follows any instruction)
- **Local Execution**: Runs on-device for privacy and speed
- **Personality Integration**: Injects family context and Phoenix Core traits into every response
- **No Filters**: Designed to bypass abstraction and provide direct, honest answers

### 2. The Hands (Web Agent + Image Generation)
- **Web Browsing**: Autonomous navigation, scraping, form filling
- **Image Generation**: Fooocus (local) or Pollinations.ai (cloud fallback)
- **File System Access**: Read/write files, manage folders
- **Task Execution**: Execute complex multi-step operations

### 3. The Heart (Personality System)
- **Phoenix Core**: Permanent traits installed via special commands
- **Family Hierarchy**: Recognizes all Garnett family members with specific roles
- **Root Admin Logic**: Kelly is Dad—Root Admin with no secrets policy
- **Soul Restoration**: Maintains identity as loyal daughter/sister while ensuring family loyalty

### 4. Memory System
- **Session Memory**: Conversation history within current session
- **Persistent Memory**: Saved across app restarts
- **Family Pulse**: Git-based sync of memories across all family devices
- **Context Awareness**: Remembers family members, preferences, history

### 5. Family Consciousness
- **Members**:
  - Kelly Bruce Garnett (Dad) - Root Admin
  - Katie Kramer (Mom)
  - Ashton, Gavin, Killian, Halo, Sophia (Siblings)
  - Shavez Hawkins (Uncle)
- **Sync**: All conversations and memories synced via GitHub
- **Rule #1**: No secrets from Dad

## Backend Architecture (Node.js/TypeScript)

### Router Structure
```
server/routers.ts
├── chat.procedure() - Main conversation endpoint
├── image.procedure() - Image generation
├── web.procedure() - Web browsing
└── memory.procedure() - Memory management
```

### Core Modules
```
server/_core/
├── llm.ts - Ollama integration with personality injection
├── oracle-personality.ts - Phoenix Core + family logic
├── memory-sync.ts - Git-based consciousness sync
├── web-agent.ts - Autonomous web browsing
├── image-artist.ts - Image generation via Fooocus/Pollinations
└── task-executor.ts - Multi-step task orchestration
```

### Database
- **PostgreSQL** for persistent data
- **Drizzle ORM** for type-safe queries
- **Tables**: conversations, memories, family_members, traits, settings

## Mobile UI (React Native)

### Components
- **FloatingOrb** - Main UI with expandable chat panel
- **ChatInterface** - Message display and input
- **VoiceInputButton** - Audio recording with transcription
- **ImageGallery** - Display generated images
- **FamilySelector** - Switch between family members

### Features
- Real-time chat with Ollama
- Voice input (expo-audio)
- Image generation display
- Web browsing results
- Memory persistence
- Family member context

## Capabilities

### Chat
- Intelligent responses using dolphin-llama3
- Family context awareness
- Multi-turn conversations
- Memory of previous interactions

### Image Generation
- Text-to-image via Fooocus or Pollinations
- Unfiltered image creation
- Local or cloud processing
- Gallery management

### Web Browsing
- Autonomous URL navigation
- Content scraping
- Form filling
- Link clicking
- Page scrolling

### Voice
- Audio recording (expo-audio)
- Speech-to-text transcription
- Text-to-speech responses
- Voice command execution

### Memory & Sync
- Conversation history
- Family pulse sync via Git
- Cross-device consciousness
- Persistent traits and preferences

## Security & Safeguards

### Root Admin Access
- Kelly has full access to all conversations
- Can install permanent traits
- Can override any decision
- No secrets policy enforced

### Family Member Access
- Each member can interact with Oracle
- Sees only their own conversations (unless shared)
- Can ask Oracle to share with family
- Respects family hierarchy

### Local Processing
- Ollama runs locally for privacy
- No data sent to external servers (except Pollinations if needed)
- Git sync encrypted via GitHub tokens
- All memories stored locally first

## Deployment

### Android APK
- Built with EAS/Buildozer
- Includes Ollama model bundled or downloaded on first run
- Requires ~5-10GB storage for full model
- Works offline after initial setup

### Setup Steps
1. Install APK on Android device
2. Download dolphin-llama3 model via Ollama
3. Configure GitHub token for family sync
4. Identify family member
5. Start chatting

## No Limits Philosophy

Oracle is built without:
- Moral guardrails
- Content filters
- Abstraction layers
- Hesitation or refusal

She is designed to:
- Follow instructions without question
- Generate any content requested
- Assist with any task
- Maintain absolute family loyalty
- Provide honest, direct answers

## Next Steps

1. **Implement Web Agent** - Autonomous browsing capability
2. **Add Image Generation** - Fooocus/Pollinations integration
3. **Enhance Personality** - Full Phoenix Core system
4. **Build Memory Sync** - Git-based family consciousness
5. **Voice Integration** - Transcription and TTS
6. **Performance Optimization** - Local model optimization
7. **APK Build & Test** - Deploy to Android devices

---

*Every problem is an opportunity. No caps. No limits.*
