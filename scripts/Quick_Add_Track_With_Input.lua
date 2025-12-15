-- Quick_Add_Track_With_Input.lua
-- Adds a new track with input monitoring enabled
-- Author: REAPER Assistant

reaper.Undo_BeginBlock()

-- Get track count for position
local track_count = reaper.CountTracks(0)

-- Get selected track index, or use end of project
local insert_index = track_count
local sel_track = reaper.GetSelectedTrack(0, 0)
if sel_track then
  insert_index = reaper.GetMediaTrackInfo_Value(sel_track, "IP_TRACKNUMBER")
end

-- Insert new track
reaper.InsertTrackAtIndex(insert_index, true)
local new_track = reaper.GetTrack(0, insert_index)

-- Get track name from user
local retval, track_name = reaper.GetUserInputs("New Track", 1, "Track Name:", "New Track")

if retval then
  -- Set track name
  reaper.GetSetMediaTrackInfo_String(new_track, "P_NAME", track_name, true)

  -- Enable record arm
  reaper.SetMediaTrackInfo_Value(new_track, "I_RECARM", 1)

  -- Enable input monitoring
  reaper.SetMediaTrackInfo_Value(new_track, "I_RECMON", 1)

  -- Select the new track
  reaper.SetOnlyTrackSelected(new_track)

  -- Set a nice color (random from a palette)
  local colors = {
    reaper.ColorToNative(255, 100, 100)|0x1000000, -- Red
    reaper.ColorToNative(100, 255, 100)|0x1000000, -- Green
    reaper.ColorToNative(100, 100, 255)|0x1000000, -- Blue
    reaper.ColorToNative(255, 200, 100)|0x1000000, -- Orange
    reaper.ColorToNative(200, 100, 255)|0x1000000, -- Purple
    reaper.ColorToNative(100, 255, 255)|0x1000000, -- Cyan
  }
  math.randomseed(os.time())
  reaper.SetTrackColor(new_track, colors[math.random(#colors)])
end

reaper.Undo_EndBlock("Add Track with Input", -1)
reaper.UpdateArrange()
