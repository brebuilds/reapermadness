import { useAppStore, LoopTrackState } from '../../stores/appStore';
import { looperTriggerTrack, looperStopAll, looperClearAll } from '../../api/client';
import { Circle, Square, Trash2, StopCircle } from 'lucide-react';

interface LooperDashboardProps {
  large?: boolean;
}

export function LooperDashboard({ large }: LooperDashboardProps) {
  const { loopTracks, setLoopTrackState } = useAppStore();

  const handleTrackTrigger = async (trackId: number) => {
    await looperTriggerTrack(trackId);

    // Update local state based on current state
    const track = loopTracks.find((t) => t.id === trackId);
    if (track) {
      let newState: LoopTrackState;
      switch (track.state) {
        case 'empty':
          newState = 'recording';
          break;
        case 'recording':
          newState = 'playing';
          break;
        case 'playing':
          newState = 'recording'; // Overdub
          break;
        case 'stopped':
          newState = 'playing';
          break;
        default:
          newState = 'recording';
      }
      setLoopTrackState(trackId, newState, newState !== 'empty');
    }
  };

  const handleStopAll = async () => {
    await looperStopAll();
    loopTracks.forEach((track) => {
      if (track.state !== 'empty') {
        setLoopTrackState(track.id, 'stopped');
      }
    });
  };

  const handleClearAll = async () => {
    await looperClearAll();
    loopTracks.forEach((track) => {
      setLoopTrackState(track.id, 'empty', false);
    });
  };

  const getTrackStyle = (state: LoopTrackState) => {
    switch (state) {
      case 'recording':
        return 'loop-btn-recording';
      case 'playing':
        return 'loop-btn-playing';
      case 'stopped':
        return 'loop-btn-stopped';
      default:
        return 'loop-btn-empty';
    }
  };

  const getTrackLabel = (state: LoopTrackState) => {
    switch (state) {
      case 'recording':
        return 'REC';
      case 'playing':
        return 'PLAY';
      case 'stopped':
        return 'STOP';
      default:
        return 'EMPTY';
    }
  };

  const trackSize = large ? 'h-32 text-2xl' : 'h-24 text-lg';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-white ${large ? 'text-2xl' : 'text-xl'}`}>
          Super8 Looper
        </h2>
        <div className="text-sm text-gray-400">
          Tracks respond to MIDI C2-G2
        </div>
      </div>

      {/* Loop tracks grid */}
      <div className={`grid ${large ? 'grid-cols-4 gap-4' : 'grid-cols-4 sm:grid-cols-8 gap-3'}`}>
        {loopTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackTrigger(track.id)}
            className={`
              loop-btn ${getTrackStyle(track.state)} ${trackSize}
              flex flex-col items-center justify-center gap-1
            `}
          >
            <span className={`font-bold ${large ? 'text-3xl' : 'text-2xl'}`}>
              {track.id}
            </span>
            <span className={`text-xs opacity-80 ${large ? 'text-sm' : ''}`}>
              {getTrackLabel(track.state)}
            </span>
            {track.state === 'recording' && (
              <Circle className="w-3 h-3 fill-current animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Global controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleStopAll}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-yellow-600 hover:bg-yellow-500 transition-colors
            font-bold ${large ? 'text-xl px-8 py-4' : ''}
          `}
        >
          <StopCircle className={large ? 'w-6 h-6' : 'w-5 h-5'} />
          Stop All
        </button>
        <button
          onClick={handleClearAll}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-red-600 hover:bg-red-500 transition-colors
            font-bold ${large ? 'text-xl px-8 py-4' : ''}
          `}
        >
          <Trash2 className={large ? 'w-6 h-6' : 'w-5 h-5'} />
          Clear All
        </button>
      </div>

      {/* MIDI mapping reference */}
      {!large && (
        <div className="bg-reaper-surface rounded-lg p-4 border border-reaper-border">
          <h3 className="font-semibold mb-2 text-gray-300">MIDI Mapping</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-sm text-gray-400">
            {[
              { track: 1, note: 'C2' },
              { track: 2, note: 'C#2' },
              { track: 3, note: 'D2' },
              { track: 4, note: 'D#2' },
              { track: 5, note: 'E2' },
              { track: 6, note: 'F2' },
              { track: 7, note: 'F#2' },
              { track: 8, note: 'G2' },
            ].map(({ track, note }) => (
              <div key={track} className="text-center">
                <div className="font-mono text-reaper-accent">{note}</div>
                <div className="text-xs">Track {track}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-sm text-gray-400">
            <span><span className="font-mono text-yellow-500">G#2</span> Stop All</span>
            <span><span className="font-mono text-red-500">A#2</span> Clear All</span>
          </div>
        </div>
      )}
    </div>
  );
}
