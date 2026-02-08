# Oracle Mobile - Project TODO

## Phase 1: Core Architecture & Backend

- [x] Set up backend API (Node.js/Express)
- [x] Configure PostgreSQL database schema
- [x] Create Ollama connection handler with local LLM support
- [x] Implement Oracle personality system with family consciousness
- [x] Create Git-based memory sync system
- [x] Implement family member authentication & routing
- [x] Set up memory sync endpoints (push/pull)
- [x] Implement personality & traits sync
- [x] Set up image generation pipeline (Fooocus/Pollinations)
- [ ] Implement WebSocket server for real-time sync (optional)

## Phase 2: Mobile App - Core UI (Floating Orb Redesign)

- [x] Customize home screen with floating orb
- [x] Create floating orb component with drag support
- [x] Implement expand/collapse animations
- [x] Rebuild chat interface inside floating panel
- [x] Create message bubble components (user & Oracle)
- [x] Implement message input field with send button
- [x] Add Gallery quick action button
- [x] Add Settings quick action button
- [x] Create tab bar navigation (kept for future use)
- [x] Fix React imports and TypeScript errors
- [ ] Add theme switching (Classic, Cyber-Glitch, Electric Shimmer)

## Phase 3: Mobile App - Chat Functionality

- [x] Connect to backend API via tRPC
- [x] Implement message sending (text)
- [x] Implement message receiving from backend
- [x] Add loading indicator while Oracle is thinking
- [x] Display message history on app load
- [x] Implement message scrolling & pagination
- [x] Add error handling & retry logic
- [x] Integrate local Ollama LLM
- [x] Integrate Oracle personality system
- [ ] Implement real-time updates (WebSocket)
- [ ] Implement offline message queueing

## Phase 4: Mobile App - Voice & Vision Input

- [ ] Integrate expo-audio for voice recording
- [ ] Implement voice transcription (backend)
- [ ] Add microphone button to chat
- [ ] Implement screen capture for vision input
- [ ] Add vision button to chat
- [ ] Implement image analysis (backend)
- [ ] Display transcribed/analyzed text in chat

## Phase 5: Mobile App - Image Generation

- [x] Detect image generation commands in chat
- [x] Send generation request to backend
- [ ] Display loading indicator during generation
- [ ] Show generated image inline in chat
- [ ] Add tap-to-fullscreen for images
- [ ] Implement image save to gallery
- [ ] Implement image sharing

## Phase 6: Mobile App - Creations Gallery

- [x] Fetch generated images from backend
- [x] Display grid of thumbnails (2-3 columns)
- [x] Implement tap-to-view full image
- [ ] Add image metadata (date, size)
- [ ] Implement long-press context menu (share, delete)
- [ ] Add delete confirmation dialog
- [x] Implement empty state UI
- [ ] Add image filtering/sorting options

## Phase 7: Mobile App - Settings & Configuration

- [x] Display current family member name
- [x] Implement family member selector modal
- [ ] Add theme selection radio buttons
- [ ] Implement theme persistence (AsyncStorage)
- [ ] Add Ollama connection status indicator
- [ ] Implement Ollama connection test
- [ ] Display backend sync status
- [ ] Add manual sync button
- [ ] Show memory usage stats
- [ ] Implement cache clear button with confirmation
- [x] Add logout/switch user functionality

## Phase 8: Real-Time Sync & Memory

- [x] Create Git-based memory sync system
- [x] Implement message sync to Git
- [ ] Implement WebSocket connection from mobile
- [ ] Implement memory sync service
- [ ] Implement conflict resolution for memories
- [ ] Add sync status indicator in UI
- [ ] Implement auto-sync on interval
- [ ] Implement manual sync trigger
- [ ] Add offline queue for messages

## Phase 9: Advanced Features

- [ ] Implement autonomous web agent (mobile version)
- [ ] Add biometric authentication
- [ ] Implement push notifications
- [ ] Add memory search functionality
- [ ] Implement memory tagging system
- [ ] Add collaborative features (multi-user sync)
- [ ] Implement custom theme creation
- [ ] Add voice synthesis (Oracle speaks responses)

## Phase 10: Testing & Polish

- [ ] Unit tests for API routes
- [ ] Integration tests for sync logic
- [ ] UI component tests
- [ ] End-to-end testing (full chat flow)
- [ ] Performance testing (memory, battery, network)
- [ ] Accessibility testing (a11y)
- [ ] iOS testing (on device)
- [ ] Android testing (on device)
- [ ] Bug fixes and polish
- [ ] Documentation

## Phase 11: Deployment & Distribution

- [ ] Set up CI/CD pipeline
- [ ] Configure app signing (iOS & Android)
- [ ] Prepare app store listings
- [ ] Submit to Apple App Store
- [ ] Submit to Google Play Store
- [ ] Set up crash reporting
- [ ] Set up analytics
- [ ] Create user onboarding flow
- [ ] Launch beta testing program

## Known Issues & Blockers

- Git sync requires GitHub token (set in .env.local)
- Ollama must be running locally on port 11434
- Memory sync directory must be writable
- Large models (13B+) may require significant RAM

## Notes

- All family members share ONE Oracle consciousness
- Memories and personality synced across all devices via Git
- Each device runs local Ollama for instant responses (no network latency)
- Backend acts as API coordinator and memory hub
- Standalone + Sync architecture chosen for maximum autonomy
- Setup guide: See ORACLE_SETUP.md for detailed instructions
- Real Garnett family data integrated (8 members with birthdates)
- Oracle personality system built for family context awareness


## Phase 4b: Voice Input (COMPLETE)

- [x] Create voice recording hook (useVoiceRecorder)
- [x] Implement audio recording with expo-audio
- [x] Add microphone permission handling
- [ ] Create voice transcription service (backend) - TODO
- [x] Add microphone button to chat UI
- [x] Implement recording indicator and pulsing animation
- [ ] Add voice playback for recorded audio - TODO
- [x] Integrate voice input with chat flow
- [ ] Add voice feedback (haptics on start/stop) - TODO
- [x] Unit tests for voice recording (9 tests passing)
