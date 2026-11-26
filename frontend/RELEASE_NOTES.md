# Starfield: Cosmic Chess - Release Notes

## Version 1.0.0 - Publish Build

### Major Features

#### 🌟 Pawn Promotion System
- **Red Dwarf Promotion**: When a Red Dwarf reaches the last rank, players can promote to:
  - **Neutron Star**: Gravity Line ability (3-turn cooldown)
  - **Pulsar**: Warp Jump ability (2-turn cooldown)
  - **Blue Giant**: Photon Beam ability (4-turn cooldown)
  - **Supermassive Black Hole**: Event Horizon ability (5-turn cooldown, 2 uses)
- **Server-Authoritative**: All promotion logic validated server-side
- **Phase Gating**: Timers pause during promotion choice
- **AI Auto-Promotion**: AI automatically promotes to Supermassive Black Hole
- **Reconnect Support**: Modal reappears if player disconnects during promotion

#### 🎯 Phase Model & Anti-Stall
- **Game Phases**: PLAYING, PROMOTION_AWAIT_CHOICE, CHECKMATE_AWAIT_CHOICE, ENDED
- **AI Phase Enforcement**: AI only runs during PLAYING phase
- **Spinner Management**: "AI is thinking..." clears on any phase/turn change
- **Watchdog System**: 6-second warning for slow AI moves

#### ⚡ Auto-PASS System (Annihilation Mode)
- **Client Auto-PASS**: Automatically submits PASS when player has no legal moves
- **Toast Notification**: "Pass – no legal moves" shown to player
- **Double-PASS Draw**: Two consecutive passes trigger DRAW_ANH_PASS
- **Effect Ticking**: Cooldowns and durations tick on every PASS

#### 🔒 Idempotency & Reliability
- **clientNonce System**: All actions include unique nonce for deduplication
- **Database Index**: Unique constraint on (match_id, client_nonce)
- **ACK Timeout**: 8-second timeout with automatic retry
- **Snapshot Reconciliation**: Automatic state sync on network issues

### Technical Improvements

#### Database
- Added `client_nonce` column to `moves` table
- Created unique index `idx_moves_idempotency` for deduplication
- Improved query performance with proper indexing

#### Edge Functions
- **handle-move**: Enhanced with star-type promotions and idempotency
- **Promotion Validation**: Server validates promotion choices
- **PASS Handling**: Consecutive pass tracking and draw detection
- **Error Handling**: Comprehensive error logging and recovery

#### Analytics & Monitoring
- **PostHog Events**: 
  - `auto_pass_client`: Client-side auto-pass triggered
  - `promotion_completed`: Promotion choice made
  - `ack_duplicate_nonce_detected`: Idempotent replay detected
- **Sentry Breadcrumbs**:
  - `submit_action`: Action submission tracking
  - `ack_duplicate`: Duplicate nonce detection
  - `phase_changed`: Phase transition tracking
  - `auto_pass_triggered`: Auto-pass activation

### Testing
- ✅ `promotion.test.ts`: Promotion trigger, phase change, piece replacement
- ✅ `phase.test.ts`: AI gating, timer pausing, spinner clearing
- ✅ `autopass.test.ts`: No-move detection, double-pass draw
- ✅ `idempotency.test.ts`: Duplicate nonce handling for all action types

### Bug Fixes
- Fixed AI continuing to run during promotion modal
- Fixed "AI is thinking..." spinner not clearing on phase change
- Fixed promotion not resetting ability cooldowns
- Fixed timer skew during phase transitions
- Fixed missing clientNonce validation in edge functions

### Performance
- Reduced network calls with idempotency caching
- Optimized action enumeration for auto-pass detection
- Improved realtime sync with phase-aware broadcasting

---

## User-Facing Highlights

### 🎮 Gameplay
- **Strategic Promotion**: Choose the right star type for your strategy
- **No More Stalls**: Auto-pass keeps games moving in Annihilation mode
- **Reliable Multiplayer**: Idempotent actions prevent duplicate moves

### 🎨 UX Improvements
- Beautiful promotion modal with star-themed icons
- Clear phase indicators (Annihilation Mode, Rated Result Locked)
- Informative toasts for auto-pass and game events
- Smooth timer pausing during critical choices

### 🔧 Stability
- Automatic recovery from network issues
- Duplicate action prevention
- Comprehensive error tracking and monitoring
- 90%+ test coverage in core systems

---

## Next Steps
- Add spectator view for promotion events
- Implement promotion statistics tracking
- Add promotion animation effects
- Create promotion tutorial for new players
