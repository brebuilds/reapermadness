import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  transportPlay,
  transportStop,
  transportRecord,
  transportToggleRepeat,
  transportToggleMetronome,
  transportGoToStart,
  setTempo,
} from '../../api/client';
import {
  Play,
  Square,
  Circle,
  Repeat,
  SkipBack,
  Timer,
  Minus,
  Plus,
} from 'lucide-react';

interface TransportBarProps {
  compact?: boolean;
}

export function TransportBar({ compact }: TransportBarProps) {
  const { isPlaying, isRecording, repeatEnabled, tempo, setTransportState } =
    useAppStore();
  const [tempoInput, setTempoInput] = useState(tempo.toString());

  const handlePlay = async () => {
    await transportPlay();
    setTransportState({ isPlaying: true });
  };

  const handleStop = async () => {
    await transportStop();
    setTransportState({ isPlaying: false, isRecording: false });
  };

  const handleRecord = async () => {
    await transportRecord();
    setTransportState({ isRecording: !isRecording });
  };

  const handleRepeat = async () => {
    await transportToggleRepeat();
    setTransportState({ repeatEnabled: !repeatEnabled });
  };

  const handleGoToStart = async () => {
    await transportGoToStart();
  };

  const handleMetronome = async () => {
    await transportToggleMetronome();
  };

  const handleTempoChange = async (delta: number) => {
    const newTempo = Math.min(400, Math.max(20, tempo + delta));
    await setTempo(newTempo);
    setTransportState({ tempo: newTempo });
    setTempoInput(newTempo.toString());
  };

  const handleTempoSubmit = async () => {
    const newTempo = parseInt(tempoInput);
    if (!isNaN(newTempo) && newTempo >= 20 && newTempo <= 400) {
      await setTempo(newTempo);
      setTransportState({ tempo: newTempo });
    } else {
      setTempoInput(tempo.toString());
    }
  };

  const btnSize = compact ? 'p-3 text-base' : 'p-4 text-lg';
  const iconSize = compact ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div
      className={`
        bg-reaper-surface rounded-xl border border-reaper-border
        ${compact ? 'p-2' : 'p-4'}
      `}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Go to start */}
        <button
          onClick={handleGoToStart}
          className={`transport-btn bg-reaper-border hover:bg-reaper-accent ${btnSize}`}
          title="Go to Start"
        >
          <SkipBack className={iconSize} />
        </button>

        {/* Play */}
        <button
          onClick={handlePlay}
          className={`transport-btn ${
            isPlaying
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-reaper-border hover:bg-green-600'
          } ${btnSize}`}
          title="Play"
        >
          <Play className={iconSize} />
        </button>

        {/* Stop */}
        <button
          onClick={handleStop}
          className={`transport-btn bg-reaper-border hover:bg-yellow-600 ${btnSize}`}
          title="Stop"
        >
          <Square className={iconSize} />
        </button>

        {/* Record */}
        <button
          onClick={handleRecord}
          className={`transport-btn ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 animate-pulse'
              : 'bg-reaper-border hover:bg-red-600'
          } ${btnSize}`}
          title="Record"
        >
          <Circle className={iconSize} fill={isRecording ? 'currentColor' : 'none'} />
        </button>

        {/* Repeat */}
        <button
          onClick={handleRepeat}
          className={`transport-btn ${
            repeatEnabled
              ? 'bg-reaper-accent hover:bg-blue-500'
              : 'bg-reaper-border hover:bg-reaper-accent'
          } ${btnSize}`}
          title="Toggle Loop"
        >
          <Repeat className={iconSize} />
        </button>

        {/* Metronome */}
        <button
          onClick={handleMetronome}
          className={`transport-btn bg-reaper-border hover:bg-reaper-accent ${btnSize}`}
          title="Toggle Metronome"
        >
          <Timer className={iconSize} />
        </button>

        {/* Tempo control */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => handleTempoChange(-1)}
            className={`transport-btn bg-reaper-border hover:bg-reaper-accent ${compact ? 'p-2' : 'p-3'}`}
            title="Decrease Tempo"
          >
            <Minus className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>

          <div className="flex flex-col items-center">
            <input
              type="text"
              value={tempoInput}
              onChange={(e) => setTempoInput(e.target.value)}
              onBlur={handleTempoSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTempoSubmit()}
              className={`
                w-16 text-center font-mono font-bold bg-reaper-bg rounded
                border border-reaper-border focus:border-reaper-accent focus:outline-none
                ${compact ? 'text-lg py-1' : 'text-xl py-2'}
              `}
            />
            <span className="text-xs text-gray-500">BPM</span>
          </div>

          <button
            onClick={() => handleTempoChange(1)}
            className={`transport-btn bg-reaper-border hover:bg-reaper-accent ${compact ? 'p-2' : 'p-3'}`}
            title="Increase Tempo"
          >
            <Plus className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </div>
      </div>
    </div>
  );
}
