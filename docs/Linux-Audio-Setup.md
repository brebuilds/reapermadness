# Linux Audio Setup Guide

Complete guide for setting up REAPER on Linux with low-latency audio for live looping.

## Overview

REAPER runs natively on Linux! For best performance, especially live looping, you'll want:

1. **JACK or PipeWire** (not plain PulseAudio)
2. **Realtime privileges** for your user
3. **Optimized buffer settings**

## Audio System Options

### Option 1: PipeWire (Recommended for Modern Systems)

PipeWire is the modern replacement for both PulseAudio and JACK. It's pre-installed on Fedora 34+, Ubuntu 22.10+, and most modern distros.

**Check if PipeWire is running:**
```bash
systemctl --user status pipewire
```

**Install PipeWire JACK support:**
```bash
# Ubuntu/Debian
sudo apt install pipewire-jack qpwgraph

# Fedora
sudo dnf install pipewire-jack qpwgraph

# Arch
sudo pacman -S pipewire-jack qpwgraph
```

**Enable JACK compatibility:**
```bash
# This creates JACK-compatible socket
systemctl --user enable --now pipewire-jack
```

### Option 2: JACK2 (Traditional Pro Audio)

JACK2 is the classic choice for professional audio work.

**Install:**
```bash
# Ubuntu/Debian
sudo apt install jackd2 qjackctl

# Fedora
sudo dnf install jack-audio-connection-kit qjackctl

# Arch
sudo pacman -S jack2 qjackctl
```

**Start JACK:**
1. Open **QjackCtl**
2. Click **Setup** to configure
3. Set sample rate: 48000
4. Set buffer size: 128 or 256
5. Enable realtime
6. Click **Start**

## Realtime Privileges Setup

For lowest latency, your user needs realtime scheduling privileges.

### Method 1: Audio Group (Recommended)

```bash
# Add yourself to the audio group
sudo usermod -aG audio $USER

# Create limits file
sudo tee /etc/security/limits.d/audio.conf << 'EOF'
@audio - rtprio 99
@audio - memlock unlimited
@audio - nice -20
EOF

# Log out and back in for changes to take effect
```

### Method 2: RealtimeKit (Automatic)

Most desktop distros include rtkit which handles this automatically:

```bash
# Install if not present
sudo apt install rtkit  # Debian/Ubuntu
sudo dnf install rtkit  # Fedora
```

## REAPER Configuration

### 1. Install REAPER

Download from https://www.reaper.fm/download.php (Linux x86_64)

```bash
# Extract
tar -xf reaper*_linux_x86_64.tar.xz
cd reaper_linux_x86_64

# Install (to home directory)
./install-reaper.sh

# Or system-wide
sudo ./install-reaper.sh --install /opt
```

### 2. Configure Audio Device

1. Open REAPER
2. Go to `Options > Preferences > Audio > Device`
3. Select **JACK** (works with both JACK and PipeWire)
4. REAPER should auto-connect to JACK

### 3. Optimize Settings

For live performance:

| Setting | Value |
|---------|-------|
| Audio system | JACK |
| Sample rate | 48000 Hz |
| Block size | 128 or 256 |
| Thread priority | Realtime |

## Windows VST Plugins with yabridge

yabridge lets you run Windows VST2/VST3 plugins on Linux.

### Install yabridge

**Arch Linux:**
```bash
yay -S yabridge-bin
```

**Ubuntu/Debian:**
```bash
# Download latest release from GitHub
wget https://github.com/robbert-vdh/yabridge/releases/latest/download/yabridge-x86_64.tar.gz
tar -xf yabridge-x86_64.tar.gz
mv yabridge ~/.local/share/

# Add to PATH
echo 'export PATH="$HOME/.local/share/yabridge:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Install Wine

```bash
# Ubuntu
sudo apt install wine64 wine32

# Fedora
sudo dnf install wine

# Arch
sudo pacman -S wine wine-mono wine-gecko
```

### Setup Windows VST Folder

```bash
# Create VST folder in Wine
mkdir -p ~/.wine/drive_c/Program\ Files/VSTPlugins
mkdir -p ~/.wine/drive_c/Program\ Files/Common\ Files/VST3

# Add to yabridge
yabridgectl add ~/.wine/drive_c/Program\ Files/VSTPlugins
yabridgectl add ~/.wine/drive_c/Program\ Files/Common\ Files/VST3

# Sync (do this after installing any Windows plugin)
yabridgectl sync
```

### Configure REAPER

1. Go to `Options > Preferences > Plug-ins > VST`
2. Add paths:
   - `~/.vst`
   - `~/.vst3`
3. Click **Re-scan**

## Troubleshooting

### No Audio Output

1. Check JACK/PipeWire is running:
   ```bash
   systemctl --user status pipewire
   # or
   jack_lsp  # Lists JACK ports
   ```

2. Check connections with qpwgraph or qjackctl

3. Verify REAPER's audio device in Preferences

### Xruns / Audio Dropouts

1. **Increase buffer size** to 256 or 512
2. **Set CPU governor to performance:**
   ```bash
   sudo cpupower frequency-set -g performance
   ```
3. **Disable WiFi/Bluetooth during performance**
4. **Close browsers and other apps**

### Plugin Not Found After yabridge Sync

1. Check Wine is working:
   ```bash
   wine --version
   ```

2. Re-run sync:
   ```bash
   yabridgectl sync
   ```

3. Check REAPER VST paths include `~/.vst` and `~/.vst3`

### MIDI Device Not Working

1. List MIDI devices:
   ```bash
   aconnect -l
   ```

2. Check REAPER Preferences > MIDI Devices

3. For USB MIDI, check device is recognized:
   ```bash
   lsusb | grep -i midi
   ```

## Performance Checklist for Live Looping

- [ ] Using JACK or PipeWire (not PulseAudio)
- [ ] Realtime privileges configured
- [ ] Buffer size 128-256 samples
- [ ] Sample rate 48000 Hz
- [ ] CPU governor set to performance
- [ ] WiFi/Bluetooth disabled
- [ ] Unnecessary apps closed
- [ ] USB MIDI controller connected and recognized
- [ ] Super8 looper loaded and working
- [ ] MIDI mapping tested

## Useful Commands

```bash
# Check audio system
pactl info | grep "Server Name"  # Shows PipeWire or PulseAudio

# List JACK ports
jack_lsp

# Check realtime limits
ulimit -r

# CPU governor status
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

# Start JACK with specific settings
jackd -R -d alsa -r 48000 -p 128 -n 2

# Monitor PipeWire performance
pw-top
```

## Resources

- [REAPER Linux Forum](https://forum.cockos.com/forumdisplay.php?f=52)
- [yabridge Wiki](https://github.com/robbert-vdh/yabridge/wiki)
- [LinuxMusicians Forum](https://linuxmusicians.com/)
- [Arch Wiki - Pro Audio](https://wiki.archlinux.org/title/Professional_audio)
