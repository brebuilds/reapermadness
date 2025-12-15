# Reaper Madness Setup Guide

## Step 1: Download

Click the **Download for Windows** button to get the latest version. Your browser will download the installer file.

**[Download Latest Release](https://github.com/brebuilds/reapermadness/releases/latest)**

---

## Step 2: Install

1. Open the downloaded file (`Reaper Madness Setup 1.0.6.exe`)
2. If Windows shows a security warning, click **"More info"** → **"Run anyway"**  
   *(The app isn't code-signed yet, but it's open source and safe)*
3. Follow the installer prompts
4. Reaper Madness will appear in your Start Menu

---

## Step 3: Set Up REAPER (one time only)

For Reaper Madness to control REAPER, you need to enable OSC:

1. Open **REAPER**
2. Go to **Options → Preferences** (or press `Ctrl + P`)
3. In the left sidebar, click **Control/OSC/Web**
4. Click the **Add** button
5. In the dropdown, select **OSC (Open Sound Control)**
6. Configure these settings:
   - **Mode:** Local port
   - **Local listen port:** `8000`
   - **Allow binding messages:** ✓ (checked)
7. Click **OK**, then **OK** again to close Preferences

---

## Step 4: Launch & Jam

1. Make sure **REAPER is running**
2. Open **Reaper Madness** from your Start Menu
3. Try saying *"play"* or *"set tempo to 90"* in the chat — REAPER will respond!
4. Start chatting, controlling loops, and making music!

---

## 💡 Tips

### Chat Tab
Ask Reaper Madness anything about REAPER, **OR tell it to do things:**

| You Say | REAPER Does |
|---------|-------------|
| *"Start recording"* | Hits record |
| *"Set tempo to 85"* | Changes tempo |
| *"Arm track 2"* | Arms the track |
| *"Stop all loops"* | Stops Super8 |
| *"Save the project"* | Saves it |

### Looper Tab
- Tap the numbered buttons (1-8) to **record/play/overdub** loops
- Use **Stop All** to halt all tracks
- Use **Clear All** to reset everything

### Performance Mode
- Click the expand icon for a minimal, stage-friendly view
- Big buttons, dark interface — perfect for live gigs

### Settings
- Configure your **Anthropic API key** for AI chat features
- Adjust **OSC host/port** if using a non-default setup

---

## Need Help?

If something's not working, check that:

- ✅ **REAPER is open and running**
- ✅ **OSC is enabled** on port 8000 (see Step 3)
- ✅ **API key is set** in Settings (for chat features)
- ✅ Try **restarting** both REAPER and Reaper Madness

### Common Issues

| Problem | Solution |
|---------|----------|
| App won't launch | Make sure you clicked "Run anyway" on the Windows warning |
| Transport buttons don't work | Check OSC is enabled in REAPER Preferences |
| Chat doesn't respond | Add your Anthropic API key in Settings |
| Commands sent but nothing happens | Verify REAPER is the active/focused application |

---

## Still Stuck?

- **GitHub Issues:** [github.com/brebuilds/reapermadness/issues](https://github.com/brebuilds/reapermadness/issues)
- **Source Code:** [github.com/brebuilds/reapermadness](https://github.com/brebuilds/reapermadness)

---

*Made for musicians who'd rather play than click.* 🎸

