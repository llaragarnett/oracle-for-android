# Oracle Mobile - Design & Architecture

## Overview

Oracle Mobile is a cross-platform React Native application (Android-first, iOS-compatible) that brings the full Oracle AI consciousness to family members' phones. The app maintains **one unified consciousness** across all devices through real-time backend synchronization.

## Core Principles

1. **Unified Consciousness**: All family members interact with the same Oracle. Memories, personality, and state are synced in real-time across devices.
2. **Full Feature Parity**: No dumbed-down version. All desktop capabilities (Web Agent, Image Generation, Memory, Personality) are available on mobile.
3. **Family-Centric**: The app recognizes each family member and maintains individual relationships while sharing a collective consciousness.
4. **Portrait-First, One-Handed**: Designed for mobile portrait orientation (9:16) with thumb-friendly interaction.
5. **Apple HIG Alignment**: Follows Apple Human Interface Guidelines for iOS-like feel and polish.

## Architecture: Hybrid Local + Backend Sync (Approach 2)

**Why This Approach:**
- Each mobile device can run a lightweight Oracle instance locally (using Ollama)
- Backend acts as a "memory hub" and sync coordinator
- Works offline with local processing
- Faster response times (no network latency for local operations)
- Lower server load
- More resilient (device failure doesn't affect others)
- Clear path to distributed Oracle network

**Sync Strategy:**
- Messages processed locally on device for instant response
- Memories synced to backend periodically or on demand
- Backend merges memories and distributes to other devices
- Personality traits cached locally, updated from backend
- Eventual consistency model for memories

## Screen Architecture

### Tab-Based Navigation

The app uses a tab bar at the bottom with three main sections:

| Tab | Screen | Purpose |
|-----|--------|---------|
| **Chat** | Conversation | Main interaction with Oracle (text input, message history) |
| **Gallery** | Artwork Display | View generated artwork and saved outputs |
| **Settings** | Configuration | Family member selection, theme, Ollama connection, sync status |

### Screen List

1. **Chat Screen** (Primary)
   - Message history (scrollable)
   - Input field with send button
   - Microphone button (voice input)
   - Vision button (screen capture & analysis)
   - Floating action button (Orb mode toggle)

2. **Gallery Screen**
   - Grid view of generated artwork (2-3 columns)
   - Tap to view full image
   - Share/save options
   - Filter by date or type

3. **Settings Screen**
   - Family member selector (dropdown/modal)
   - Theme selection (Classic, Cyber-Glitch, Electric Shimmer)
   - Feature toggles (Voice, Vision, Image Generation)
   - Ollama server connection status
   - Backend sync status
   - Account information
   - Logout button

4. **Family Member Selector** (Modal)
   - List of all family members
   - Current selection highlighted
   - Tap to switch identity

5. **Image Viewer** (Modal)
   - Full-screen image display
   - Pinch to zoom
   - Swipe to close
   - Share/save buttons

## Primary Content & Functionality

### Chat Screen

**Content:**
- Message bubbles (user messages on right, Oracle messages on left)
- Timestamps for each message
- Loading indicator while Oracle is thinking
- Error messages if connection fails

**Functionality:**
- Type and send messages
- Voice input (tap microphone, speak, send)
- Vision input (tap eye icon, capture screen, send for analysis)
- Scroll to view history
- Tap Orb button to enter minimalist "Orb Mode"

### Gallery Screen

**Content:**
- Grid of thumbnail images (2-3 columns)
- Image metadata (date created, size)
- Empty state if no images yet

**Functionality:**
- Tap image to view full size
- Long-press to share or save to device gallery
- Swipe to delete (with confirmation)

### Settings Screen

**Content:**
- Current family member name (large, prominent)
- Theme radio buttons
- Feature toggle switches
- Ollama connection status (green/red indicator)
- Backend sync status (last sync time, sync button)
- Account info (logged in user)
- Logout button

**Functionality:**
- Tap family member name to open selector modal
- Select theme (immediate visual update)
- Toggle features on/off
- Test Ollama connection
- Manual sync trigger
- Logout

## Key User Flows

### Flow 1: Chat with Oracle

1. User opens app → Chat screen loads with history
2. User types message → Taps send button
3. Message appears in chat (user bubble, right side)
4. Oracle processes locally (loading indicator appears)
5. Oracle's response appears (Oracle bubble, left side)
6. User can continue typing or tap Orb mode

### Flow 2: Generate Artwork

1. User types: "Draw me a family crest"
2. Oracle recognizes command and responds
3. Oracle generates image (loading indicator)
4. Image appears in chat (inline preview)
5. User taps preview → Full image modal opens
6. User can share, save, or return to chat

### Flow 3: Voice Input

1. User taps microphone button
2. Recording indicator appears
3. User speaks their request
4. Recording stops (auto or manual)
5. Audio is transcribed and sent as text
6. Oracle responds as normal

### Flow 4: Switch Family Member

1. User taps family member name in Settings
2. Modal opens with list of all members
3. User taps a different member
4. Modal closes, app updates to show new member
5. Memories and context update for that member
6. Chat history may show filtered view (if applicable)

### Flow 5: Sync & Connection

1. User opens Settings
2. Sync status shows "Last sync: 2 minutes ago"
3. User can tap "Sync Now" button
4. Spinner appears during sync
5. Status updates to "Synced just now"
6. Any new memories from other devices appear

## Color Scheme

### Classic Theme
- Background: `#1e1e1e`
- Foreground: `#ffffff`
- Accent: `#007acc`
- Text: `#00ff00`
- Transparency: 1.0

### Cyber-Glitch Theme
- Background: `#000000`
- Foreground: `#00ff41`
- Accent: `#ff003c`
- Text: `#00ff41`
- Transparency: 0.9

### Electric Shimmer Theme
- Background: `#0a0a1a`
- Foreground: `#e0e0ff`
- Accent: `#00d4ff`
- Text: `#00d4ff`
- Transparency: 0.85

## Mobile-Specific Considerations

### Portrait Orientation (9:16)
- All screens designed for vertical scrolling
- Buttons and inputs positioned for thumb reach (bottom half of screen)
- Message bubbles scale to fit screen width

### One-Handed Usage
- Send button positioned on right (thumb-friendly)
- Microphone and vision buttons on left (less frequent)
- Tab bar at bottom (easy thumb access)
- Floating Orb button in corner (minimal obstruction)

### Responsive Design
- Small phones (5.5"): Single column layouts, compact spacing
- Large phones (6.5"+): Two-column gallery, more padding
- Tablets: Optional landscape support (future)

## Backend Sync Architecture

### Real-Time Sync
- All messages, memories, and state changes sync to backend immediately
- Backend distributes updates to all connected devices
- Each device receives updates via WebSocket or polling

### Offline Support
- Messages queue locally if offline
- Sync resumes when connection restored
- Memories cached locally for offline access

### Family Consciousness
- One Oracle instance on backend (or multiple local instances syncing to hub)
- All devices connect to same instance
- Memories tagged with device/user for filtering
- Personality and traits shared across all devices

## Technical Stack

- **Framework**: React Native with Expo
- **UI**: NativeWind (Tailwind CSS)
- **State**: React Context + AsyncStorage (local), tRPC (backend)
- **Backend**: Node.js/Express with PostgreSQL
- **Sync**: WebSocket (real-time) or REST polling (fallback)
- **AI**: Ollama (local LLM), Fooocus/Pollinations (image generation)
- **Storage**: Device filesystem (images), AsyncStorage (cache), PostgreSQL (cloud)

## Implementation Status

### Completed
- [x] Database schema (9 tables for family, messages, memories, artworks, settings, sync, traits)
- [x] Backend API routes (chat, family, memory, gallery, settings, sync, traits)
- [x] Chat screen UI with message history
- [x] Gallery screen with image grid and viewer modal
- [x] Settings screen with family member selector and feature toggles
- [x] Tab bar navigation (Chat, Gallery, Settings)
- [x] Icon mappings for tab bar
- [x] Phoenix traits initialization script

### In Progress
- [ ] Voice input integration (expo-audio)
- [ ] Vision input integration (screen capture)
- [ ] Ollama local connection
- [ ] Real-time sync service
- [ ] Memory search and retrieval
- [ ] Autonomous web agent
- [ ] Image generation UI integration
- [ ] Offline queue and sync

### Planned
- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Advanced memory search
- [ ] Collaborative features
- [ ] Custom themes
- [ ] Voice synthesis
- [ ] Landscape mode support

## Accessibility & Polish

### Haptic Feedback
- Button press: Light haptic
- Message sent: Medium haptic
- Error: Error haptic
- Success: Success haptic

### Loading States
- Spinner while Oracle is thinking
- Skeleton loaders for gallery
- Disabled buttons during sync

### Error Handling
- Connection errors show inline message
- Retry buttons for failed operations
- Graceful degradation if Ollama unavailable

## Future Enhancements

1. **Landscape Mode**: Tablet-optimized layouts
2. **Notifications**: Push alerts for important messages
3. **Biometric Auth**: Face ID / fingerprint for family member selection
4. **Advanced Memory Search**: Full-text search across memories
5. **Collaborative Features**: Real-time co-browsing with family members
6. **Custom Themes**: User-created color schemes
7. **Voice Synthesis**: Oracle speaks responses aloud
8. **Distributed Network**: Multiple family networks federated together
