# REAPER OSC Setup Guide

This guide explains how to configure REAPER to receive OSC commands from the REAPER Assistant.

## Quick Setup

### 1. Open REAPER Preferences

- Press `Ctrl+P` (or `Cmd+,` on macOS)
- Or go to `Options > Preferences`

### 2. Navigate to Control/OSC/Web

In the left sidebar, click on **Control/OSC/Web**

### 3. Add OSC Device

1. Click the **Add** button
2. Select **OSC (Open Sound Control)**
3. Configure as follows:

| Setting | Value |
|---------|-------|
| Device name | REAPER Assistant |
| Mode | Configure device IP+local port |
| Device IP | 127.0.0.1 |
| Device port | 9000 |
| Local listen port | 8000 |
| Local IP | 127.0.0.1 |
| Allow binding to all interfaces | ☑ (checked) |

4. Pattern config: **Default** (or leave as-is)
5. Click **OK**

### 4. Click OK to Save

Close the preferences dialog.

## Verify Connection

1. Start the REAPER Assistant server:
   ```bash
   cd packages/server
   pnpm dev
   ```

2. Open the web app at http://localhost:5173

3. Go to **Settings** and click **Test Connection**

4. Try clicking **Play** - REAPER should start playback!

## OSC Patterns Used

The REAPER Assistant uses these OSC patterns:

### Transport
| Pattern | Description |
|---------|-------------|
| `/play 1` | Start playback |
| `/stop 1` | Stop playback |
| `/record 1` | Toggle recording |
| `/repeat 1` | Toggle repeat/loop |
| `/click 1` | Toggle metronome |

### Tempo
| Pattern | Description |
|---------|-------------|
| `/tempo/raw {bpm}` | Set tempo (e.g., `/tempo/raw 120.0`) |

### Actions
| Pattern | Description |
|---------|-------------|
| `/action/{id}` | Trigger action by ID |

### Super8 Looper (via MIDI)
| Pattern | Description |
|---------|-------------|
| `/vkb_midi/0/36/127` | Track 1 (C2) |
| `/vkb_midi/0/37/127` | Track 2 (C#2) |
| `/vkb_midi/0/38/127` | Track 3 (D2) |
| `/vkb_midi/0/39/127` | Track 4 (D#2) |
| `/vkb_midi/0/40/127` | Track 5 (E2) |
| `/vkb_midi/0/41/127` | Track 6 (F2) |
| `/vkb_midi/0/42/127` | Track 7 (F#2) |
| `/vkb_midi/0/43/127` | Track 8 (G2) |
| `/vkb_midi/0/44/127` | Stop All |
| `/vkb_midi/0/46/127` | Clear All |

## Troubleshooting

### No Response from REAPER

1. **Check OSC is enabled**: Verify the OSC device shows in Control/OSC/Web preferences
2. **Check ports**: Ensure port 8000 isn't used by another app
3. **Check firewall**: Allow UDP traffic on ports 8000 and 9000
4. **Restart REAPER**: Some OSC settings require a restart

### Commands Received but Wrong Behavior

1. **Check pattern config**: Use "Default" pattern config in REAPER
2. **Check action IDs**: Verify action IDs in Actions list (`?` key)

### Linux-Specific Issues

On Linux with JACK:
- Ensure REAPER is running with JACK audio
- OSC works independently of the audio system
- Check that no firewall is blocking localhost UDP

## Custom OSC Patterns

To customize OSC patterns in REAPER:

1. In Control/OSC/Web preferences, set Pattern config to a custom file
2. Edit the `.ReaperOSC` file in your REAPER resource folder
3. Reference: https://www.reaper.fm/sdk/osc/osc.php

## Network Setup (Advanced)

To control REAPER from another device:

1. Set **Device IP** to your controller's IP address
2. Set **Local IP** to your computer's local IP (e.g., 192.168.1.100)
3. Ensure both devices are on the same network
4. Configure the REAPER Assistant's OSC settings to match

Example for network control:
- Controller device: 192.168.1.50
- REAPER computer: 192.168.1.100
- In REAPER: Device IP = 192.168.1.50, Local IP = 192.168.1.100
- In Assistant: OSC Host = 192.168.1.100, Port = 8000
