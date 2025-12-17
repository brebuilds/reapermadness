import { useState, useEffect } from 'react';
import { useAppStore, UserProfile } from '../../stores/appStore';
import { X, Save, User } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { userProfile, setUserProfile } = useAppStore();

  const [name, setName] = useState('');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [audioInterface, setAudioInterface] = useState('');
  const [footController, setFootController] = useState('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [instrumentInput, setInstrumentInput] = useState('');
  const [preferredTempo, setPreferredTempo] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing profile data
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setExperience(userProfile.experience || 'intermediate');
      setAudioInterface(userProfile.gear?.audioInterface || '');
      setFootController(userProfile.gear?.footController || '');
      setInstruments(userProfile.gear?.instruments || []);
      setPreferredTempo(userProfile.preferences?.preferredTempo?.toString() || '');
      setGenres(userProfile.preferences?.genres || []);
      setGoals(userProfile.goals || []);
      setNotes(userProfile.notes || '');
    }
  }, [userProfile, isOpen]);

  const handleAddItem = (value: string, list: string[], setList: (items: string[]) => void, setInput: (value: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setInput('');
    }
  };

  const handleRemoveItem = (index: number, list: string[], setList: (items: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const profile: UserProfile = {
      name,
      experience,
      gear: {
        audioInterface: audioInterface || undefined,
        footController: footController || undefined,
        instruments,
      },
      preferences: {
        preferredTempo: preferredTempo ? parseInt(preferredTempo) : undefined,
        genres,
      },
      goals,
      notes: notes || undefined,
    };

    setUserProfile(profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-reaper-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-reaper-border">
        {/* Header */}
        <div className="sticky top-0 bg-reaper-surface border-b border-reaper-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-reaper-accent" />
            <h2 className="text-xl font-bold">Your Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-reaper-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-reaper-accent">Basic Info</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marc"
                className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Gear */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-reaper-accent">Your Gear</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Audio Interface</label>
              <input
                type="text"
                value={audioInterface}
                onChange={(e) => setAudioInterface(e.target.value)}
                placeholder="e.g., Focusrite Scarlett 2i2"
                className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Foot Controller</label>
              <input
                type="text"
                value={footController}
                onChange={(e) => setFootController(e.target.value)}
                placeholder="e.g., Boss FC-300, FCB1010"
                className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instruments</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={instrumentInput}
                  onChange={(e) => setInstrumentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(instrumentInput, instruments, setInstruments, setInstrumentInput)}
                  placeholder="Add an instrument"
                  className="flex-1 px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
                />
                <button
                  onClick={() => handleAddItem(instrumentInput, instruments, setInstruments, setInstrumentInput)}
                  className="px-4 py-2 bg-reaper-accent text-white rounded-lg hover:bg-reaper-accent-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {instruments.map((instrument, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-reaper-bg border border-reaper-border rounded-full text-sm flex items-center gap-2"
                  >
                    {instrument}
                    <button
                      onClick={() => handleRemoveItem(i, instruments, setInstruments)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-reaper-accent">Preferences</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Preferred Tempo (BPM)</label>
              <input
                type="number"
                value={preferredTempo}
                onChange={(e) => setPreferredTempo(e.target.value)}
                placeholder="120"
                min="20"
                max="400"
                className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Music Genres</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(genreInput, genres, setGenres, setGenreInput)}
                  placeholder="Add a genre"
                  className="flex-1 px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
                />
                <button
                  onClick={() => handleAddItem(genreInput, genres, setGenres, setGenreInput)}
                  className="px-4 py-2 bg-reaper-accent text-white rounded-lg hover:bg-reaper-accent-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-reaper-bg border border-reaper-border rounded-full text-sm flex items-center gap-2"
                  >
                    {genre}
                    <button
                      onClick={() => handleRemoveItem(i, genres, setGenres)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-reaper-accent">Your Goals</h3>

            <div>
              <label className="block text-sm font-medium mb-1">What do you want to achieve?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(goalInput, goals, setGoals, setGoalInput)}
                  placeholder="Add a goal"
                  className="flex-1 px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent"
                />
                <button
                  onClick={() => handleAddItem(goalInput, goals, setGoals, setGoalInput)}
                  className="px-4 py-2 bg-reaper-accent text-white rounded-lg hover:bg-reaper-accent-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {goals.map((goal, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg text-sm flex items-center justify-between"
                  >
                    <span>{goal}</span>
                    <button
                      onClick={() => handleRemoveItem(i, goals, setGoals)}
                      className="hover:text-red-400 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other details you'd like to share..."
              rows={4}
              className="w-full px-3 py-2 bg-reaper-bg border border-reaper-border rounded-lg focus:outline-none focus:border-reaper-accent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-reaper-surface border-t border-reaper-border p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-reaper-hover rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-reaper-accent text-white rounded-lg hover:bg-reaper-accent-dark transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
