# Reapermadness User Guide

**Your AI-Powered REAPER Expert Assistant**

Version 1.1.0 | Last Updated: December 2024

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Setup & Configuration](#setup--configuration)
5. [Features Overview](#features-overview)
6. [The Knowledge Base](#the-knowledge-base)
7. [What Reapermadness Can Do](#what-reapermadness-can-do)
8. [Chat Interface Guide](#chat-interface-guide)
9. [User Profile System](#user-profile-system)
10. [OSC Integration](#osc-integration)
11. [Voice Input](#voice-input)
12. [Troubleshooting](#troubleshooting)
13. [Tips & Best Practices](#tips--best-practices)
14. [FAQ](#faq)

---

## Introduction

### What is Reapermadness?

Reapermadness is your personal AI assistant for REAPER DAW, built specifically for live looping and performance. Think of it as having an experienced REAPER expert sitting next to you, ready to answer questions, explain features, and help you solve problems.

### Who is it for?

This tool is designed for:
- **Live loopers** using Super8 or other loop systems
- **REAPER users** on Windows, Mac, or Linux
- **Performers** who need quick answers during setup
- **Anyone learning** REAPER's powerful features

### What makes it special?

- 🎯 **Specialized Knowledge**: Deep expertise in Super8 looper, live performance, and REAPER workflows
- 🤖 **AI-Powered**: Uses Claude AI (Anthropic) for intelligent, conversational answers
- 🎸 **Personalized**: Learns your gear, preferences, and goals
- 💬 **Conversational**: Chat naturally like you're talking to a friend
- 🔧 **Control REAPER**: Can control transport, looper, and more via OSC (optional)

---

## Quick Start

### 5-Minute Setup

1. **Download & Install**
   - Mac: Double-click the `.dmg`, drag to Applications
   - Windows: Run the installer `.exe`

2. **Launch the App**
   - Find "Reaper Madness" in Applications/Start Menu
   - The app will open in a dark, stage-friendly interface

3. **Add Your API Key** (Required for AI chat)
   - Click **Settings** (gear icon)
   - Paste your Anthropic API key
   - Get one free at: https://console.anthropic.com/

4. **Start Chatting!**
   - Try: "How do I set up Super8 for live looping?"
   - Try: "What's the best foot controller for REAPER?"

---

## Installation

### System Requirements

**macOS:**
- macOS 10.12 or later
- Apple Silicon (M1/M2/M3) or Intel
- 200 MB disk space

**Windows:**
- Windows 10 or later (64-bit)
- 200 MB disk space

**Both Platforms:**
- Internet connection (for AI chat features)
- REAPER DAW (for OSC control features)

### Download

Get the latest version from:
https://github.com/brebuilds/reapermadness/releases/latest

- **Mac**: `Reaper Madness-{version}-arm64.dmg`
- **Windows**: `Reaper Madness Setup {version}.exe`

### Installation Steps

**macOS:**
1. Open the `.dmg` file
2. Drag "Reaper Madness" to Applications folder
3. First launch: Right-click → Open (to bypass Gatekeeper)
4. App will start automatically

**Windows:**
1. Run the installer `.exe`
2. Follow installation wizard
3. Launch from Start Menu or Desktop shortcut

---

## Setup & Configuration

### 1. API Key Setup (Required)

The AI chat requires an Anthropic API key:

**Getting Your Key:**
1. Visit: https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

**Adding to Reapermadness:**
1. Open Reapermadness
2. Click **Settings** (⚙️ icon, top-right)
3. Paste your API key in "Anthropic API Key" field
4. Click Save

**Cost:** Typically $0.02-0.05 per conversation with follow-ups. Very affordable!

### 2. Server Configuration (Optional)

The app includes a built-in server (auto-starts). You can customize:

**Server URL:**
- Default: `http://localhost:3001`
- Change if running on different port

**OSC Configuration:**
- Host: `127.0.0.1` (localhost)
- Port: `8000` (REAPER default)
- Listen Port: `9000`

### 3. REAPER OSC Setup (Optional - for control features)

Enable OSC in REAPER to allow Reapermadness to control it:

1. Open REAPER Preferences (`Ctrl+P` / `Cmd+,`)
2. Go to **Control/OSC/web**
3. Click **Add**
4. Select **OSC (Open Sound Control)**
5. Configure:
   - Mode: "Configure device as local device"
   - Local listen port: `8000`
   - Send to: `localhost:9000`
6. In "Pattern config", enable feedback for:
   - Transport state
   - Tempo
   - Track properties
7. Set send rate: 10-20 messages/sec
8. Click OK

**Note:** OSC is only needed for AI to control REAPER. Chat features work without it!

---

## Features Overview

### Core Features

#### 1. AI Chat Assistant
- Ask questions in natural language
- Get expert answers about REAPER features
- Conversational interface (not robotic!)
- Maintains context across conversation

#### 2. AI-Generated Follow-Up Questions
- After each answer, get 2-3 suggested follow-up questions
- Click to ask instantly
- Helps you discover related features
- Loading indicator while generating

#### 3. Knowledge Base Search
- 40+ comprehensive guides and references
- Super8 looper documentation
- ReaPlugs (EQ, Compressor, etc.)
- SWS extensions
- Live looping workflows
- Audio setup (ASIO, JACK, PipeWire)
- Troubleshooting guides

#### 4. User Profile System
- Save your gear (audio interface, foot controller, instruments)
- Set experience level (beginner/intermediate/advanced)
- List your goals
- Preferred tempo and genres
- AI uses this to personalize answers

#### 5. Voice Input
- Click microphone button
- Speak your question
- Auto-fills text when done
- Visual indicator when listening

#### 6. Message Management
- **Copy**: Copy any assistant response to clipboard
- **Clear**: Clear entire conversation (with confirmation)
- **Scroll**: Auto-scrolls to latest message

#### 7. Quick Query Buttons
Pre-written questions for common topics:
- 🎸 Super8 setup
- 🎹 MIDI mapping
- 🎚️ ASIO setup
- 🦶 Foot controllers
- ⚡ Fix latency
- 🔌 Best VSTs

### Advanced Features

#### 8. Streaming Responses
- Text appears as AI generates it
- No waiting for full response
- Cancel anytime

#### 9. Error Messages with Solutions
- Specific troubleshooting steps
- Detects API key issues
- Identifies connection problems
- Rate limit guidance

#### 10. Auto-Updates (Production Only)
- Checks for new versions
- Downloads in background
- Installs on quit
- (Requires code-signed build)

---

## The Knowledge Base

### What's Inside?

Reapermadness has a comprehensive knowledge base covering:

#### 1. Super8 Looper
- Complete MIDI mapping reference (C2-G2)
- Sync modes (free, tempo, length)
- Recording modes
- Track management
- Session workflow
- Tips and tricks

#### 2. ReaPlugs (Built-in Plugins)
- **ReaEQ**: Parametric equalizer
- **ReaComp**: Compressor/limiter
- **ReaDelay**: Delay effect
- **ReaVerb**: Reverb (impulse response)
- **ReaPitch**: Pitch shifter
- **ReaSynth**: Simple synthesizer
- Full parameter documentation

#### 3. Extensions
- **SWS**: Powerful extension suite
- **ReaPack**: Package manager
- **ReaLearn**: MIDI mapping
- **Playtime**: Clip launcher
- Installation and usage guides

#### 4. Live Looping Workflows
- Setup for solo performance
- Band setups
- Foot controller integration
- Best practices
- Common patterns

#### 5. Audio Configuration
- **Windows**: ASIO setup, driver optimization
- **Linux**: JACK, PipeWire configuration
- **Mac**: CoreAudio optimization
- Latency reduction
- Buffer size tuning

#### 6. Actions & Shortcuts
- ~500 most important REAPER actions
- Keyboard shortcuts
- Action IDs for custom mapping
- Workflow optimization

#### 7. Troubleshooting
- Common issues and solutions
- Audio dropouts
- Sync problems
- Plugin issues
- Performance optimization

### How the AI Uses Knowledge

When you ask a question:
1. AI searches the knowledge base
2. Finds relevant information
3. Synthesizes a conversational answer
4. Cites specific features/settings
5. Suggests next steps

**Example:**
- **You ask**: "How do I set up Super8?"
- **AI searches**: Super8 documentation
- **AI responds**: Step-by-step setup with MIDI notes, sync settings, and tips
- **Follow-ups**: "What MIDI notes control tracks?", "How do I sync to tempo?"

---

## What Reapermadness Can Do

### Answer Questions

**Any REAPER Question:**
- "What does ReaComp's Auto-makeup do?"
- "How do I record multiple tracks at once?"
- "What's the best buffer size for live looping?"
- "How do I set up track templates?"

**Live Looping Specific:**
- "How does Super8 sync work?"
- "What foot controller do you recommend?"
- "How do I prevent audio dropouts?"
- "Can I use multiple loopers in one session?"

**Setup & Configuration:**
- "How do I set up ASIO on Windows?"
- "What's the best REAPER config for live performance?"
- "How do I optimize for low latency?"
- "How do I install SWS extensions?"

**Troubleshooting:**
- "Why is my audio crackling?"
- "REAPER won't detect my audio interface"
- "Loops are out of sync, how to fix?"
- "Plugin crashes REAPER, what do I do?"

### Provide Step-by-Step Guides

The AI gives you actionable steps:

**Example - Setting up Super8:**
```
1. Add Super8 to your FX chain (Track → Add FX → Super8)
2. Set sync mode to "Tempo" in the plugin
3. Map MIDI notes:
   - C2: Trigger track 1
   - C#2: Trigger track 2
   - D2: Trigger track 3
   (etc.)
4. Arm your input track
5. Press C2 to start recording first loop
6. Press C2 again to start overdubbing

Pro tip: Set your tempo first! Super8 syncs to project tempo.
```

### Explain Complex Topics

**In Simple Terms:**
- "What's ASIO and why do I need it?"
- "Explain buffer size like I'm five"
- "What's the difference between pre-fader and post-fader sends?"

**With Context:**
The AI knows you're focused on live looping, so answers emphasize:
- Real-time performance needs
- Latency considerations
- Practical workflow tips

### Recommend Gear & Software

**Hardware:**
- Audio interfaces for your budget
- Foot controllers (Boss, FCB1010, etc.)
- MIDI controllers
- Monitors for stage use

**Software:**
- Free vs paid plugins
- Best VSTs for live looping
- Extensions to install
- Utilities for performance

### Share Best Practices

**From Years of Experience:**
- How pros set up REAPER for touring
- Common pitfalls to avoid
- Time-saving shortcuts
- Performance optimization tricks

---

## Chat Interface Guide

### Main Chat Area

**Message Types:**

**Your Messages** (right side, blue):
- Your questions and requests
- Shows input text

**Assistant Messages** (left side, dark):
- Reapermadness responses
- Includes "Reapermadness" badge
- Copy button (top-right)
- Shows tool usage (if any)

**System Messages:**
- API key prompts
- Error messages
- Status updates

### Input Area

**Text Input:**
- Type your question
- Press `Enter` to send
- `Shift+Enter` for new line (if multi-line input)

**Voice Input Button** (🎤):
- Click to start recording
- Speak your question
- Click again (or auto-stops) when done
- Text auto-fills

**Profile Button** (👤):
- Green when profile is set
- Gray when not set
- Click to open profile dialog

**Send Button** (➤):
- Click to send message
- Disabled while loading
- Disabled if input empty

### Quick Query Buttons

Pre-written questions for one-click asking:
- 🎸 Super8 setup
- 🎹 MIDI mapping
- 🎚️ ASIO setup
- 🦶 Foot controllers
- ⚡ Fix latency
- 🔌 Best VSTs

Click any to instantly ask that question.

### Follow-Up Questions

**After Each Response:**
- Purple-themed suggestion pills appear
- 2-3 AI-generated follow-up questions
- Click any to ask it
- Dismiss button (✕) to hide
- Loading state: "✨ Generating suggestions..."

**Example:**
After asking "How do I set up Super8?", you might see:
- "What MIDI notes control the individual tracks?"
- "How do I sync Super8 to my foot controller?"
- "What's the best buffer size for looping?"

### Message Actions

**Copy Button** (on assistant messages):
- Click to copy message to clipboard
- Shows checkmark confirmation
- Great for saving tips/configs

**Clear Conversation** (top-right):
- Removes all messages (except welcome)
- Confirmation dialog
- Fresh start

### Visual Indicators

**Loading States:**
- "Thinking..." - AI is processing
- "✨ Generating suggestions..." - Creating follow-ups
- Spinning icon - Request in progress

**Voice Recording:**
- Border turns blue
- Background tint
- "🎤 Listening... (speak now)" placeholder

**Error States:**
- Red message with specific help
- Troubleshooting steps included

---

## User Profile System

### Why Set Up Your Profile?

The AI gives **much better answers** when it knows:
- Your experience level (beginner/intermediate/advanced)
- Your gear (audio interface, foot controller, instruments)
- Your musical style (genres, tempo preferences)
- Your goals (what you're trying to achieve)

**Example:**
- **Without profile**: "Here are some foot controllers..."
- **With profile** (you have FCB1010): "Since you're using an FCB1010, here's how to map Super8..."

### Profile Prompt

**When it appears:**
- After 2+ messages in chat
- Only if you haven't set a profile
- Only if API key is configured

**Actions:**
- **Set up profile**: Opens profile dialog
- **Maybe later**: Dismisses (won't show again this session)

### Profile Dialog

**How to Open:**
- Click profile button (👤) in chat input area
- Click "Set up profile" in prompt

**What to Fill Out:**

#### Basic Info
- **Name**: Your name (e.g., "Marc")
- **Experience Level**:
  - Beginner: New to REAPER
  - Intermediate: Know the basics
  - Advanced: Power user

#### Your Gear
- **Audio Interface**: E.g., "Focusrite Scarlett 2i2"
- **Foot Controller**: E.g., "Boss FC-300"
- **Instruments**: Guitar, vocals, keyboard, etc. (add multiple)

#### Preferences
- **Preferred Tempo**: Your typical BPM (e.g., 120)
- **Music Genres**: Rock, jazz, electronic, etc. (add multiple)

#### Your Goals
Add what you want to achieve:
- "Master live looping"
- "Reduce latency below 10ms"
- "Learn advanced Super8 techniques"
- "Set up for live performance"

#### Additional Notes
Any other context:
- "Play in a jam band"
- "Use REAPER on Linux with JACK"
- "Need help with wireless MIDI"

**Saving:**
- Click **Save Profile**
- Profile is stored locally (persists across sessions)
- Update anytime by reopening dialog

### How AI Uses Your Profile

**Every Response Includes Context:**

**System Prompt Additions:**
```
Marc's Profile:
- Name: Marc
- Experience: Intermediate
- Audio Interface: Focusrite Scarlett 2i2
- Foot Controller: Boss FC-300
- Instruments: Guitar, vocals
- Genres: Rock, Blues
- Preferred Tempo: 85 BPM
- Goals:
  - Master live looping
  - Reduce latency for performance
```

**Result:**
- Answers reference your gear
- Suggestions match your experience level
- Tips relevant to your goals
- Tempo/genre considerations included

---

## OSC Integration

### What is OSC?

OSC (Open Sound Control) is a protocol that lets applications talk to each other. Reapermadness can use OSC to:
- **Read** REAPER state (tempo, playing/stopped, loop status)
- **Control** REAPER (play, stop, set tempo, trigger actions)

### Why Enable OSC?

**Without OSC:**
- AI can only answer questions
- No awareness of current REAPER state
- No control capabilities

**With OSC:**
- AI knows current tempo, play status
- Can reference your active project state
- Future: AI could control REAPER for you

### Setup (Step-by-Step)

**In REAPER:**

1. **Open Preferences**
   - Windows/Linux: `Ctrl+P`
   - Mac: `Cmd+,`

2. **Navigate to Control/OSC/web**
   - Left sidebar → Control/OSC/web

3. **Add OSC Device**
   - Click "Add" button
   - Select "OSC (Open Sound Control)"

4. **Configure Device**
   - **Mode**: "Configure device as local device"
   - **Local listen port**: `8000`
   - **Device sends to**:
     - Host: `localhost`
     - Port: `9000`

5. **Enable Feedback**
   - Click "Pattern config"
   - Enable these:
     - ☑ Transport state
     - ☑ Tempo
     - ☑ Track properties
   - Set send rate: 10-20 messages/sec

6. **Save**
   - Click OK on all dialogs
   - OSC is now active

**In Reapermadness:**

Settings are pre-configured:
- Host: `127.0.0.1`
- Port: `8000`
- Listen Port: `9000`

Should work automatically once REAPER is configured!

### Testing OSC Connection

**Check Health:**
1. Start REAPER with OSC enabled
2. Start Reapermadness
3. Open browser: http://localhost:3001/health
4. Should see: `{"status":"ok","osc":{"host":"127.0.0.1","port":8000}}`

**Test State:**
1. Open browser: http://localhost:3001/api/reaper/state
2. Should see current REAPER state (tempo, playing, etc.)

### OSC Features in Chat

**State Awareness:**
The AI can see:
- Current tempo
- Play/stop status
- Recording status
- Loop track states (future)

**Example:**
```
You: "What's my current tempo?"
AI: "I see you're at 120 BPM. Want to change it?"

You: "Is REAPER playing?"
AI: "No, transport is stopped. Ready to start?"
```

**Future Control Features** (Planned):
- "Set tempo to 85 BPM" → AI executes
- "Start recording" → AI triggers record
- "Arm track 2" → AI arms the track

---

## Voice Input

### Browser Compatibility

**Supported:**
- ✅ Chrome, Edge, Brave (Chromium browsers)
- ✅ Safari (Mac/iOS)
- ❌ Firefox (limited support)

**Note:** Voice input uses browser's Web Speech API

### How to Use

1. **Click Microphone Button** (🎤)
   - Input field border turns blue
   - Background has subtle tint
   - Placeholder: "🎤 Listening... (speak now)"

2. **Speak Your Question**
   - Speak clearly and naturally
   - Pause briefly between phrases
   - Browser shows recording indicator

3. **Stop Recording**
   - Click microphone button again
   - Or wait for auto-stop (after silence)

4. **Review & Send**
   - Transcribed text appears in input
   - Edit if needed
   - Click send or press Enter

### Tips for Best Results

**Do:**
- ✅ Speak clearly at normal pace
- ✅ Use natural language
- ✅ Pause after your question
- ✅ Check transcription before sending

**Don't:**
- ❌ Rush or mumble
- ❌ Use in noisy environments
- ❌ Speak too quietly
- ❌ Expect 100% accuracy (AI fixes errors usually)

**Example Questions:**
- "How do I set up Super8 for live looping?"
- "What's the best foot controller for REAPER?"
- "Why is my audio crackling?"

### Troubleshooting Voice Input

**No Microphone Button?**
- Browser doesn't support Web Speech API
- Try Chrome or Edge

**Permission Denied?**
- Grant microphone permission when prompted
- Check browser settings → Permissions

**Inaccurate Transcription?**
- Speak more clearly
- Reduce background noise
- Edit text before sending

**Button Stuck Recording?**
- Click again to stop
- Refresh page if stuck

---

## Troubleshooting

### App Won't Start

**Symptoms:** App closes immediately, shows error dialog, or black screen

**Solutions:**

1. **Check Console Logs**
   - **Mac**: Run from Terminal:
     ```bash
     /Applications/Reaper\ Madness.app/Contents/MacOS/Reaper\ Madness
     ```
   - **Windows**: Check error dialog message

2. **Port Already in Use**
   - Error: "Port 3001 already in use"
   - Solution: Close other apps using port 3001
   - Or change port in Settings

3. **Missing Node.js** (Unlikely)
   - Error mentions "node not found"
   - Solution: Reinstall app (Node should be bundled)

4. **Antivirus Blocking**
   - Windows: Antivirus may block server process
   - Solution: Add exception for Reaper Madness

5. **Permissions Issue**
   - Mac: App not opened from Applications folder
   - Solution: Move to Applications, run from there

### Chat Not Working

**Symptoms:** Can't send messages, no responses, errors

**Solutions:**

1. **No API Key**
   - Message: "Please add your Anthropic API key"
   - Solution: Go to Settings, add API key

2. **Invalid API Key**
   - Error: "Invalid API key. Update in Settings."
   - Solution: Check key starts with `sk-ant-`
   - Get new key from console.anthropic.com

3. **Rate Limited**
   - Error: "Rate limit exceeded. Wait a moment."
   - Solution: Wait 1-2 minutes, try again
   - Happens with heavy usage

4. **Server Not Running**
   - Error: "Cannot connect to server"
   - Solution:
     - Restart app
     - Check http://localhost:3001/health
     - Check firewall settings

5. **Network Issues**
   - Error: "Network error"
   - Solution: Check internet connection
   - Try different network

### Slow Responses

**Symptoms:** Waiting 10+ seconds for responses

**Solutions:**

1. **Slow Internet**
   - Check connection speed
   - Try wired connection
   - Close bandwidth-heavy apps

2. **Large Conversation**
   - Many messages = more processing
   - Solution: Click "Clear" to start fresh

3. **Anthropic API Slowdown**
   - Rare, but happens
   - Solution: Wait a moment, retry

### Follow-Ups Not Appearing

**Symptoms:** No follow-up questions after response

**Solutions:**

1. **Loading Failed**
   - Follow-ups generate after main response
   - Wait 3-5 seconds
   - "✨ Generating suggestions..." should appear

2. **Dismissed Accidentally**
   - Clicked ✕ dismiss button
   - Solution: Ask another question

3. **API Error**
   - Check console logs
   - Retry next message

### Voice Input Issues

See [Voice Input → Troubleshooting](#troubleshooting-voice-input) above.

### OSC Not Working

**Symptoms:** AI doesn't know REAPER state, can't control

**Solutions:**

1. **REAPER OSC Not Enabled**
   - Solution: Follow [OSC Setup](#osc-integration) steps

2. **Wrong Ports**
   - Check REAPER uses port 8000
   - Check Reapermadness Settings match

3. **REAPER Not Running**
   - Start REAPER before testing
   - Restart both apps

4. **Firewall Blocking**
   - Allow localhost communication
   - Disable firewall temporarily to test

5. **Test Connection**
   - Visit: http://localhost:3001/api/reaper/state
   - Should show state JSON
   - If blank/error, OSC not connected

### Profile Not Saving

**Symptoms:** Profile resets after closing app

**Solutions:**

1. **LocalStorage Cleared**
   - Browser/app cache cleared
   - Solution: Re-enter profile

2. **Multiple App Instances**
   - Don't run multiple Reaper Madness instances
   - Close duplicates

3. **Permission Issues**
   - App can't write to storage
   - Solution: Reinstall app

### App Crashes

**Symptoms:** App closes unexpectedly

**Solutions:**

1. **Check Error Logs**
   - Mac: Console.app, filter "Reaper Madness"
   - Windows: Event Viewer

2. **Auto-Updater Error** (Fixed in v1.1.0)
   - Old versions crashed on unsigned apps
   - Solution: Update to v1.1.0+

3. **Memory Issues**
   - Very long conversations
   - Solution: Clear chat periodically

4. **Report Bug**
   - GitHub: https://github.com/brebuilds/reapermadness/issues
   - Include error logs

---

## Tips & Best Practices

### Getting Better Answers

**Be Specific:**
- ❌ "How do I loop?"
- ✅ "How do I set up Super8 for live guitar looping?"

**Provide Context:**
- ❌ "It's not working"
- ✅ "Super8 won't sync to tempo. I'm at 120 BPM, sync mode is 'Tempo', but loops drift."

**Use Your Profile:**
- Fill out profile completely
- AI references your gear automatically
- Better suggestions for your experience level

**Ask Follow-Ups:**
- Use the AI-generated follow-up buttons
- Build on previous answers
- "Explain that in simpler terms"

**One Topic at a Time:**
- ❌ "How do I set up ASIO, map MIDI, and fix latency?"
- ✅ Ask each separately, build conversation

### Conversation Management

**Start Fresh When Needed:**
- Click "Clear" for new topics
- Prevents confusion from old context
- Keeps responses focused

**Copy Important Info:**
- Click copy button on valuable answers
- Save to notes/docs
- Build your personal knowledge base

**Use Quick Queries:**
- Fast way to ask common questions
- Great for beginners
- Discover features you didn't know existed

### Profile Maintenance

**Keep Updated:**
- Got new gear? Update profile
- Goals changed? Update them
- AI gives more relevant answers

**Add Detail:**
- More info = better answers
- Include specific models/versions
- Mention unique setup details

### Voice Input Tips

**Use for:**
- ✅ Quick questions while playing
- ✅ Hands-free during setup
- ✅ When typing is inconvenient

**Don't use for:**
- ❌ Technical terms (gets confused)
- ❌ Noisy environments
- ❌ Long, complex questions

**Verify Transcription:**
- Always check text before sending
- Fix obvious errors
- AI can often figure out close approximations

### OSC Usage

**Keep REAPER Running:**
- OSC only works when REAPER is open
- State awareness requires active connection

**Don't Rely on OSC for Chat:**
- Chat works fine without OSC
- OSC is enhancement, not requirement

**Test Regularly:**
- Check http://localhost:3001/api/reaper/state
- Ensure connection is stable

### Performance

**Close When Not Needed:**
- App runs local server (uses resources)
- Close when not actively using

**Monitor API Usage:**
- Check Anthropic console for costs
- Typical usage: $0.02-0.05 per conversation
- Clear chat to reduce token usage

**Update Regularly:**
- New versions have bug fixes
- Performance improvements
- New features

---

## FAQ

### General Questions

**Q: Do I need REAPER installed?**
A: No, for chat features. Yes, if you want OSC control features.

**Q: Does this work offline?**
A: No, requires internet for AI chat. Knowledge base is local, but AI needs Anthropic API.

**Q: How much does it cost?**
A: App is free. You pay for Anthropic API usage (~$0.02-0.05 per conversation).

**Q: Is my data private?**
A: Your questions go to Anthropic's servers (see their privacy policy). Profile stored locally only.

**Q: Can I use this on Linux?**
A: Currently Mac and Windows only. Linux support planned (run from source works now).

### Setup Questions

**Q: Where do I get an API key?**
A: https://console.anthropic.com/ - Sign up, go to API Keys, create new key.

**Q: My API key isn't working?**
A: Ensure it starts with `sk-ant-`, check it's not expired, verify billing is set up.

**Q: Do I need to configure OSC?**
A: No, it's optional. Chat works without it. OSC enables state awareness and control.

**Q: Can I change the port?**
A: Yes, in Settings. Change Server URL to `http://localhost:YOUR_PORT`.

### Feature Questions

**Q: Why aren't follow-ups appearing?**
A: Wait 3-5 seconds after response. Uses separate AI call (Claude Haiku).

**Q: Can the AI control REAPER for me?**
A: Not yet (in development). OSC infrastructure is ready, control features coming soon.

**Q: How do I save conversations?**
A: Copy messages you want to keep. No export feature yet (coming soon).

**Q: Can I customize the quick queries?**
A: Not yet, but planned for future release.

### Troubleshooting Questions

**Q: App won't start on Mac?**
A: Run from Applications folder. Right-click → Open first time (Gatekeeper).

**Q: Windows Defender blocking?**
A: Add exception for Reaper Madness. It's safe (scan with VirusTotal if concerned).

**Q: Voice input not working?**
A: Use Chrome/Edge. Check microphone permissions. Firefox support limited.

**Q: Getting "server not running" error?**
A: Restart app. Check firewall. Verify http://localhost:3001/health works.

**Q: Chat is slow?**
A: Clear conversation, check internet speed, try again later.

### Usage Questions

**Q: Can I ask about plugins besides ReaPlugs?**
A: Yes! Ask about any REAPER-compatible plugin. AI has general knowledge.

**Q: Does it know about specific hardware?**
A: Yes, extensive knowledge of audio interfaces, foot controllers, MIDI gear.

**Q: Can it help with Lua scripting?**
A: Yes, ask REAPER scripting questions. AI knows ReaScript API.

**Q: What about video editing in REAPER?**
A: Yes, AI knows video features. Focused on audio/live looping but versatile.

**Q: Can I ask non-REAPER questions?**
A: AI is specialized for REAPER. Can answer general DAW questions but optimized for REAPER.

---

## Getting Help

### Support Resources

**Documentation:**
- This guide (USER_GUIDE.md)
- README.md in repo
- GitHub wiki (coming soon)

**Community:**
- GitHub Discussions: https://github.com/brebuilds/reapermadness/discussions
- Report bugs: https://github.com/brebuilds/reapermadness/issues

**Contact:**
- GitHub: @brebuilds
- Email: (via GitHub profile)

### Reporting Bugs

**Before Reporting:**
1. Check this troubleshooting guide
2. Search existing issues
3. Try latest version

**When Reporting:**
Include:
- OS and version
- App version
- Steps to reproduce
- Error messages
- Screenshots if applicable
- Console logs (if available)

**Create Issue:**
https://github.com/brebuilds/reapermadness/issues/new

---

## Appendix

### Keyboard Shortcuts

Currently minimal (more coming):
- `Enter`: Send message
- `Shift+Enter`: New line (if multi-line input)

### API Endpoints

For advanced users/developers:

**Health Check:**
- `GET /health` - Server status

**Knowledge:**
- `GET /api/search?q=query` - Search knowledge base
- `GET /api/knowledge/super8` - Super8 info
- `GET /api/knowledge/plugins` - Plugin list
- `GET /api/knowledge/troubleshooting` - Troubleshooting guides

**Chat:**
- `POST /api/chat/stream` - Streaming chat (SSE)

**REAPER State:**
- `GET /api/reaper/state` - Current state
- `GET /api/reaper/state/stream` - Live state updates (SSE)

**Transport Control:**
- `POST /api/transport/play` - Play
- `POST /api/transport/stop` - Stop
- `POST /api/transport/record` - Record

**Looper:**
- `POST /api/looper/track/{n}` - Trigger track
- `POST /api/looper/stop-all` - Stop all tracks
- `POST /api/looper/clear-all` - Clear all tracks

### Version History

**v1.1.0** (Current)
- AI-generated follow-up questions
- Copy message to clipboard
- Clear conversation
- Profile completion prompt
- Voice input visual indicator
- Better error messages
- Auto-updater fixes
- Critical bug fixes (state closure, validation)

**v1.0.8**
- Black screen fix
- Full MCP tool support
- Logging improvements

**v1.0.7**
- Desktop app improvements
- Bug fixes

**v1.0.0**
- Initial release
- Basic chat functionality
- Knowledge base
- OSC integration

---

## Credits

**Developed by:** Bre (@brebuilds)

**Powered by:**
- Anthropic Claude AI (Sonnet 4 & Haiku 3)
- Electron
- React + Vite
- Node.js
- Express

**Built for:** Marc and the REAPER community

**License:** MIT

---

**Enjoy making music with Reapermadness! 🎸**

*Last updated: December 2024 | v1.1.0*
