-- Set_Buffer_For_Live.lua
-- Optimizes REAPER settings for live performance (low latency)
-- Author: REAPER Assistant

-- This script sets audio preferences for low-latency live performance
-- Note: Some settings require REAPER restart to take effect

reaper.Undo_BeginBlock()

-- Get current audio device info
local audio_device = reaper.GetAudioDeviceInfo("IDENT", "")

-- Recommended buffer settings for live performance
local LIVE_BUFFER_SIZE = 128  -- samples
local LIVE_SAMPLE_RATE = 48000

-- Show dialog with recommendations
local message = [[
LIVE PERFORMANCE OPTIMIZATION

For best live performance with low latency:

BUFFER SIZE: 128-256 samples
• Lower = less latency but more CPU
• 128 samples @ 48kHz = ~2.7ms latency
• 256 samples @ 48kHz = ~5.3ms latency

SAMPLE RATE: 48000 Hz
• Standard for most interfaces
• Good balance of quality and performance

RECOMMENDED STEPS:
1. Open Preferences (Ctrl+P)
2. Go to Audio > Device
3. Set buffer size to 128 or 256
4. Set sample rate to 48000

ON LINUX:
• Use JACK or PipeWire (not PulseAudio)
• Set JACK buffer to 128 or 256
• Ensure realtime priority is enabled

CURRENT DEVICE: ]] .. tostring(audio_device) .. [[


Press OK to open Audio Preferences.]]

local result = reaper.ShowMessageBox(message, "Live Performance Setup", 1)

if result == 1 then
  -- Open audio device preferences
  reaper.Main_OnCommand(40099, 0) -- Open preferences
end

reaper.Undo_EndBlock("Live Buffer Optimization Info", -1)
