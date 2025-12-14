# REAPER DAW Complete Knowledge Base

## Overview

**REAPER** (Rapid Environment for Audio Production, Engineering, and Recording) is a professional digital audio workstation developed by Cockos Incorporated, founded by Justin Frankel (creator of Winamp and Gnutella).

- **Initial Release**: 2006
- **Current Version**: 7.x
- **Platforms**: Windows, macOS, Linux
- **Philosophy**: Lightweight, highly customizable, affordable professional DAW
- **Installer Size**: ~25MB (remarkably small for a full-featured DAW)

### Key Strengths
- Unlimited tracks (audio, MIDI, video)
- Extremely customizable (themes, shortcuts, scripting)
- Low CPU usage and fast startup
- Professional features at indie price
- Active community and regular updates
- Portable installation option

---

## Pricing & Licensing

### Discounted License: $60 USD
**Eligibility:**
- Individuals or businesses with annual gross revenue under $20,000 USD from products using REAPER
- Educational institutions
- Non-profit organizations

### Commercial License: $225 USD
**For:**
- Businesses with annual gross revenue of $20,000 USD or more from products using REAPER

### Trial
- **Duration**: 60 days
- **Limitations**: None - full functionality
- **Note**: Continues working after trial with a reminder message

### Upgrades
- Free minor version updates
- Discounted major upgrades ($60 USD)

---

## Core Features

### Audio & MIDI
- Unlimited audio and MIDI tracks
- Non-destructive editing
- 64-bit audio processing
- Support for high sample rates (up to 192kHz+)
- Comprehensive MIDI editing with piano roll, drum editor, notation

### Routing
- Flexible routing matrix
- Unlimited sends/receives per track
- Hardware outputs routing
- Sidechain support for any plugin
- Folder track summing
- Channel splitting/combining

### Version 7 Highlights
- AI-powered stretch markers
- Improved MIDI editing
- Enhanced video support
- New built-in effects
- Performance improvements
- Updated default theme

---

## Built-in Plugins (ReaPlugs)

REAPER includes professional-grade effects:

### ReaEQ
**Type**: Parametric Equalizer
- Unlimited bands
- Multiple filter types (low/high shelf, peak, notch, bandpass)
- Real-time spectrum analyzer
- Efficient CPU usage

### ReaComp
**Type**: Compressor
- Soft/hard knee options
- Auto makeup gain
- Sidechain input with filtering
- Visual compression display
- Classic analog-style sound

### ReaGate
**Type**: Noise Gate/Expander
- Adjustable attack/release
- Look-ahead capability
- Sidechain filtering
- Hysteresis for smooth operation

### ReaDelay
**Type**: Multi-tap Delay
- Multiple delay taps
- Tempo sync
- Ping-pong mode
- Filter per tap
- Feedback control

### ReaVerb
**Type**: Convolution Reverb
- Impulse response loading
- Built-in IR generation
- Echo generator
- Low CPU mode
- Wet/dry mix

### ReaPitch
**Type**: Pitch Shifter
- Real-time pitch shifting
- Formant preservation option
- Multiple algorithms
- Low latency mode

### ReaLimit
**Type**: Brickwall Limiter
- True peak limiting
- Auto release
- Visual metering
- Mastering-quality

### ReaXcomp
**Type**: Multiband Compressor
- Up to 32 bands
- Per-band solo/mute
- FFT display
- Flexible crossover points

### ReaSynth
**Type**: Synthesizer
- Multiple waveforms
- Filter section
- ADSR envelopes
- Simple but effective

### ReaSamplOmatic5000
**Type**: Sampler
- Multi-sample support
- Round-robin playback
- Velocity layers
- ADSR envelope
- Great for drums and one-shots

---

## JSFX (Jesusonic Effects)

REAPER's built-in scripted effects format using EEL2 language.

### Advantages
- Zero latency
- Cross-platform compatible
- Real-time code editing
- Hundreds of community effects
- Included with REAPER at no cost

### Categories Available
- Dynamics (compressors, limiters, gates)
- EQ/Filters
- Modulation (chorus, flanger, phaser)
- Reverb/Delay
- Distortion/Saturation
- Analysis/Metering
- Utility (gain, routing, M/S)
- MIDI processors

### Notable JSFX
- **Super8 Looper**: 8-track looper for live performance
- **Loudness Meter**: LUFS metering
- **Pitch Correction**: Basic auto-tune
- **Spectral Analyzer**: FFT display

---

## Essential Extensions

### SWS/S&M Extension (Free)
**Website**: https://www.sws-extension.org/

The must-have extension adding hundreds of features:

- **Snapshots**: Save/recall track states
- **Auto-color**: Automatic track coloring
- **Cycle Actions**: Create complex action sequences
- **Region/Marker Management**: Enhanced organization
- **Track Templates**: Quick setup
- **Custom Actions Builder**: Create macros
- **Groove Tool**: Timing/velocity humanization
- **LFO Generator**: Automate any parameter

### ReaPack (Free)
**Website**: https://reapack.com/

Package manager for scripts and extensions:

- One-click script installation
- Automatic updates
- Multiple repositories
- Dependency management

**Popular Repositories:**
- ReaTeam Scripts
- MPL Scripts
- Lokasenna GUI library
- X-Raym Scripts

### Playtime 2 (Commercial)
**Developer**: Helgoboss

Clip launcher extension (like Ableton Session View):
- Grid-based clip triggering
- Scene launching
- Quantized clip start
- MIDI controller support
- Full integration with REAPER mixer

### ReaLearn (Free)
**Developer**: Helgoboss

Advanced MIDI/OSC controller mapping:
- Complex conditional mappings
- Virtual control surfaces
- OSC support
- Preset management
- Group mappings

---

## Scripting (ReaScript)

REAPER offers powerful scripting capabilities:

### Supported Languages

**Lua** (Recommended)
- Fast execution
- Good documentation
- Large community
- Easy to learn

**EEL2**
- REAPER's native language
- Direct memory access
- Used for JSFX
- Maximum performance

**Python**
- Familiar syntax
- External library access
- Requires setup

### Capabilities
- Track/item manipulation
- MIDI editing automation
- Automation control
- Custom dialog creation
- File I/O operations
- Extension development

### Resources
- Built-in API documentation (Help menu)
- ReaScript_API.txt in REAPER folder
- Cockos forum scripting section
- ReaPack for community scripts

---

## Themes & Customization

### Default Theme
REAPER 7 includes a modern, clean default theme.

### Popular Themes
- **Imperial** - Pro Tools-like layout
- **Blender** - Cubase-inspired
- **I Like Turtles** - Logic Pro style
- **Flat Madness** - Ableton-inspired flat design

### Customization
Using Walter theme engine:
- Complete UI redesign
- Custom graphics
- Layout changes
- Color schemes

**Location**: Options > Themes

---

## Keyboard Shortcuts

### Transport
| Key | Action |
|-----|--------|
| Space | Play/Stop |
| Enter | Play/Pause |
| W | Go to start |
| R | Toggle record |
| Ctrl+R | Toggle loop |
| Home/End | Start/End of project |

### Editing
| Key | Action |
|-----|--------|
| S | Split item at cursor |
| Ctrl+C/V/X | Copy/Paste/Cut |
| Ctrl+Z | Undo |
| Delete | Delete selected |
| G | Group items |
| U | Ungroup items |

### Navigation
| Key | Action |
|-----|--------|
| Ctrl+Plus/Minus | Zoom in/out |
| Ctrl+Scroll | Zoom at cursor |
| Page Up/Down | Scroll |
| Tab | Next transient |

### Tracks
| Key | Action |
|-----|--------|
| Ctrl+T | New track |
| M | Mute |
| Solo button | Solo |
| F | Toggle FX window |
| V | Toggle visibility |

### Markers
| Key | Action |
|-----|--------|
| M | Insert marker |
| Shift+M | Insert with prompt |
| 1-9 | Go to marker 1-9 |

### Customization
Access via: Actions > Show action list (press ?)
- Assign any key combination
- Create custom actions (macros)
- Import/export keymaps
- Search all 4000+ actions

---

## Live Looping

REAPER excels at live looping with multiple approaches:

### Super8 Looper (Built-in JSFX)
8-track looper included with REAPER.

**Features:**
- 8 independent loop tracks
- MIDI controllable
- Sync to project tempo
- Overdub mode
- Half-speed/reverse playback

**MIDI Mapping:**
| Note | Function |
|------|----------|
| C2 | Record/Play Track 1 |
| C#2 | Record/Play Track 2 |
| D2 | Record/Play Track 3 |
| D#2 | Record/Play Track 4 |
| E2 | Record/Play Track 5 |
| F2 | Record/Play Track 6 |
| F#2 | Record/Play Track 7 |
| G2 | Record/Play Track 8 |
| A2 | Stop All |
| A#2 | Clear All |

### Playtime 2 (Extension)
Full clip launcher similar to Ableton Live:
- Unlimited clips per track
- Scene triggering
- Quantized clip launch
- Follow actions
- Visual grid interface

### Mobius (Free VST)
Advanced looper inspired by EDP and hardware loopers:
- EDP-style looping
- Multiple tracks
- Extensive scripting
- Complex routing options

### MSuperLooper (Free VST)
16-track looper by Melda Production:
- 16 independent tracks
- Tempo sync
- Effects per loop
- Modern interface

### Hardware Recommendations

**MIDI Foot Controllers:**
- Behringer FCB1010 (budget, 10 footswitches)
- Morningstar MC6/MC8 (premium, programmable)
- Boss ES-8 (with built-in audio switching)
- Line 6 Helix (if using for amp modeling too)

**Audio Interfaces:**
- Low latency (<10ms round-trip)
- Multiple inputs for instruments
- MIDI I/O for controllers
- Examples: Focusrite Scarlett, MOTU M-series, RME Babyface

### Performance Tips
1. Use ASIO drivers on Windows
2. Set buffer to 64-128 samples for live playing
3. Freeze tracks not being used live
4. Use track templates for quick setup
5. Create custom actions for loop operations
6. Consider dedicated SSD for projects

---

## Workflows

### Podcast Production

**Setup:**
1. Create track per speaker
2. Enable auto-punch for retakes
3. Use ReaGate for noise reduction
4. Set up loudness metering (-16 LUFS)

**Recommended Plugins:**
- ReaEQ for voice cleanup
- ReaComp for consistent levels
- ReaGate for noise gating
- JS: LUFS Loudness Meter

### Audiobook Production

**ACX Requirements:**
- Peak level: -3dB maximum
- Noise floor: -60dB or lower
- RMS level: -23dB to -18dB

**Setup:**
1. Template with ACX specs
2. Room tone/noise print for cleanup
3. Loudness metering with target
4. Batch export for chapters

### Film/Video Scoring

**Setup:**
1. Import video to dedicated track
2. Use markers for hit points
3. Set up tempo mapping to picture
4. Configure video output window

**Tips:**
- Use region render matrix for stems
- Embed timecode in renders
- Create stems: dialogue, music, effects

---

## System Requirements

### Windows
**Minimum:**
- Windows 7 or later
- SSE2 capable processor
- 2 GB RAM
- 100 MB disk space

**Recommended:**
- Windows 10/11
- Multi-core processor (i5/i7/Ryzen 5+)
- 8 GB RAM or more
- SSD for projects

### macOS
**Minimum:**
- macOS 10.5 or later
- Intel or Apple Silicon
- 2 GB RAM

**Recommended:**
- macOS 12 or later
- Apple Silicon (M1/M2) or Intel i5+
- 8 GB RAM or more

### Linux
**Requirements:**
- Most distributions supported
- GTK3, ALSA or JACK
- x86_64 processor

**Note:** Native Linux version with excellent JACK integration.

---

## File Formats

### Import
WAV, AIFF, MP3, OGG, FLAC, WavPack, MIDI, MP4/M4A (with FFmpeg), various video formats

### Export
WAV (16/24/32-bit), AIFF, MP3, OGG Vorbis, FLAC, WavPack, Video (with FFmpeg)

### Project Format
- Extension: .rpp
- Plain text format
- Human-readable
- Version control friendly

---

## Learning Resources

### Official
- **REAPER User Guide**: https://www.reaper.fm/userguide.php
- **What's New**: https://reaper.fm/whatsnew.php

### Community
- **Cockos Forums**: https://forum.cockos.com/
- **r/Reaper**: https://reddit.com/r/reaper
- **REAPER Discord**: Community chat

### Video Tutorials
- **REAPER Mania** (YouTube): Comprehensive tutorials
- **Kenny Gioia** (YouTube/Groove3): Official REAPER videos
- **The REAPER Blog**: Tips and tricks

### Books
- "The REAPER User Guide" by Geoffrey Francis
- "Up and Running with REAPER" by Geoffrey Francis

---

## Troubleshooting

### High Latency
1. Reduce buffer size (try 128 samples)
2. Use ASIO driver on Windows
3. Check for plugins with high PDC
4. Disable WiFi and background processes

### Audio Dropouts
1. Increase buffer size slightly
2. Check CPU usage in Performance Meter
3. Freeze resource-heavy tracks
4. Disable unused tracks/plugins

### MIDI Not Responding
1. Check MIDI device enabled in Preferences
2. Verify MIDI channel matches
3. Use MIDI Monitor to debug
4. Enable "input for control messages"

### Looper Not Syncing
1. Verify Super8/Playtime sync mode
2. Check project tempo is set
3. Ensure transport running for synced mode
4. Try tap tempo to establish beat

---

*This knowledge base is optimized for AI assistants and RAG systems. Query conversationally about any REAPER topic!*
