-- Create_Looping_Setup.lua
-- Creates a complete live looping template with Super8
-- Author: REAPER Assistant

-- Configuration
local INPUT_TRACK_NAME = "Input"
local LOOPER_TRACK_NAME = "Super8 Looper"
local FX_TRACK_NAME = "Master FX"
local DEFAULT_TEMPO = 120

reaper.Undo_BeginBlock()

-- Set tempo
reaper.SetCurrentBPM(0, DEFAULT_TEMPO, true)

-- Insert Input Track
reaper.InsertTrackAtIndex(0, true)
local input_track = reaper.GetTrack(0, 0)
reaper.GetSetMediaTrackInfo_String(input_track, "P_NAME", INPUT_TRACK_NAME, true)

-- Enable record arm and monitoring on input track
reaper.SetMediaTrackInfo_Value(input_track, "I_RECARM", 1)
reaper.SetMediaTrackInfo_Value(input_track, "I_RECMON", 1) -- Input monitoring

-- Set track color (green for input)
reaper.SetTrackColor(input_track, reaper.ColorToNative(50, 200, 50)|0x1000000)

-- Insert Looper Track
reaper.InsertTrackAtIndex(1, true)
local looper_track = reaper.GetTrack(0, 1)
reaper.GetSetMediaTrackInfo_String(looper_track, "P_NAME", LOOPER_TRACK_NAME, true)

-- Set track color (blue for looper)
reaper.SetTrackColor(looper_track, reaper.ColorToNative(50, 150, 255)|0x1000000)

-- Add Super8 JSFX to looper track
reaper.TrackFX_AddByName(looper_track, "super8", false, -1)

-- Create send from input to looper
reaper.CreateTrackSend(input_track, looper_track)

-- Disable main send on input track (only goes to looper)
reaper.SetMediaTrackInfo_Value(input_track, "B_MAINSEND", 0)

-- Insert Master FX Track
reaper.InsertTrackAtIndex(2, true)
local fx_track = reaper.GetTrack(0, 2)
reaper.GetSetMediaTrackInfo_String(fx_track, "P_NAME", FX_TRACK_NAME, true)

-- Set track color (orange for FX)
reaper.SetTrackColor(fx_track, reaper.ColorToNative(255, 150, 50)|0x1000000)

-- Add limiter to FX track
reaper.TrackFX_AddByName(fx_track, "utility/limiter", false, -1)

-- Create send from looper to FX track
reaper.CreateTrackSend(looper_track, fx_track)

-- Disable main send on looper track
reaper.SetMediaTrackInfo_Value(looper_track, "B_MAINSEND", 0)

-- Select the input track for easy access
reaper.SetTrackSelected(input_track, true)
reaper.SetTrackSelected(looper_track, false)
reaper.SetTrackSelected(fx_track, false)

reaper.Undo_EndBlock("Create Live Looping Setup", -1)

-- Refresh arrange view
reaper.UpdateArrange()

-- Show message
reaper.ShowMessageBox(
  "Live Looping Setup Created!\n\n" ..
  "• Input track with monitoring\n" ..
  "• Super8 Looper track\n" ..
  "• Master FX track with limiter\n\n" ..
  "Set your input source on the Input track and start looping!\n" ..
  "MIDI notes C2-G2 control Super8 tracks 1-8.",
  "Setup Complete",
  0
)
