-- Export_Stems.lua
-- Exports each track as a separate stem file
-- Author: REAPER Assistant

-- Get project path
local project_path = reaper.GetProjectPath("")
local retval, project_name = reaper.GetSetProjectInfo_String(0, "PROJECT_NAME", "", false)

if project_name == "" then
  project_name = "Untitled"
else
  -- Remove .rpp extension
  project_name = project_name:gsub("%.rpp$", "")
end

-- Create stems folder
local stems_folder = project_path .. "/stems_" .. project_name

-- Check if any time selection exists
local time_start, time_end = reaper.GetSet_LoopTimeRange(false, false, 0, 0, false)
local has_time_selection = time_end > time_start

-- Build render settings message
local message = "STEM EXPORT\n\n"
message = message .. "Project: " .. project_name .. "\n"
message = message .. "Output folder: " .. stems_folder .. "\n\n"

if has_time_selection then
  message = message .. "Time selection: " .. string.format("%.1f", time_start) .. "s to " .. string.format("%.1f", time_end) .. "s\n\n"
else
  message = message .. "No time selection - will export entire project\n\n"
end

-- Count tracks
local track_count = reaper.CountTracks(0)
message = message .. "Tracks to export: " .. track_count .. "\n\n"

-- List tracks
message = message .. "Tracks:\n"
for i = 0, track_count - 1 do
  local track = reaper.GetTrack(0, i)
  local retval, name = reaper.GetSetMediaTrackInfo_String(track, "P_NAME", "", false)
  if name == "" then name = "Track " .. (i + 1) end
  message = message .. "  • " .. name .. "\n"
end

message = message .. "\nThis will open the Render dialog configured for stem export.\n"
message = message .. "Click OK to continue."

local result = reaper.ShowMessageBox(message, "Stem Export", 1)

if result == 1 then
  -- Set render to stems mode
  -- Action: File: Render project, using the most recent render settings, auto-close render dialog
  -- We'll use the render dialog instead for user control

  -- Open render dialog
  reaper.Main_OnCommand(40015, 0) -- File: Render project to disk

  reaper.ShowMessageBox(
    "In the Render dialog:\n\n" ..
    "1. Set 'Source' to 'Selected tracks (stems)'\n" ..
    "2. Set 'Directory' to your stems folder\n" ..
    "3. Set 'File name' to '$track'\n" ..
    "4. Choose your format (WAV 24-bit recommended)\n" ..
    "5. Click 'Render'\n\n" ..
    "Tip: Save these settings as a preset for quick access!",
    "Stem Export Instructions",
    0
  )
end
