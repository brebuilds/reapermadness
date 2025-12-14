-- Toggle_All_Track_Monitoring.lua
-- Toggles input monitoring on all armed tracks
-- Useful for live performance setup
-- Author: REAPER Assistant

reaper.Undo_BeginBlock()

local track_count = reaper.CountTracks(0)
local toggled_count = 0
local new_state = nil  -- Will be set by first armed track

for i = 0, track_count - 1 do
  local track = reaper.GetTrack(0, i)
  local is_armed = reaper.GetMediaTrackInfo_Value(track, "I_RECARM")

  if is_armed == 1 then
    local current_mon = reaper.GetMediaTrackInfo_Value(track, "I_RECMON")

    -- Set state based on first armed track (toggle all to same state)
    if new_state == nil then
      new_state = (current_mon == 0) and 1 or 0
    end

    reaper.SetMediaTrackInfo_Value(track, "I_RECMON", new_state)
    toggled_count = toggled_count + 1
  end
end

reaper.Undo_EndBlock("Toggle Track Monitoring", -1)
reaper.UpdateArrange()

-- Feedback
if toggled_count > 0 then
  local state_text = (new_state == 1) and "ON" or "OFF"
  reaper.ShowConsoleMsg("Input monitoring " .. state_text .. " for " .. toggled_count .. " armed track(s)\n")
else
  reaper.ShowConsoleMsg("No armed tracks found\n")
end
