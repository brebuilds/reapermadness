import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { healthCheck, updateOSCConfig } from '../../api/client';
import { Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function Settings() {
  const { oscHost, oscPort, apiKey, setSettings } = useAppStore();
  const [localHost, setLocalHost] = useState(oscHost);
  const [localPort, setLocalPort] = useState(oscPort.toString());
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [isTesting, setIsTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const port = parseInt(localPort);
    if (isNaN(port)) return;

    setSettings({
      oscHost: localHost,
      oscPort: port,
      apiKey: localApiKey,
    });

    // Also update the server's OSC config
    try {
      await updateOSCConfig({ host: localHost, port });
    } catch (e) {
      console.error('Failed to update server OSC config:', e);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('unknown');

    try {
      await healthCheck();
      setConnectionStatus('connected');
    } catch (e) {
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">Configure OSC connection to REAPER</p>
      </div>

      {/* Connection Status */}
      <div className="bg-reaper-surface rounded-lg p-4 border border-reaper-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connectionStatus === 'connected' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {connectionStatus === 'error' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            {connectionStatus === 'unknown' && (
              <div className="w-5 h-5 rounded-full bg-gray-500" />
            )}
            <span className="text-white">
              Server Status:{' '}
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'error'
                ? 'Not Connected'
                : 'Unknown'}
            </span>
          </div>
          <button
            onClick={testConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-reaper-border hover:bg-reaper-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            Test
          </button>
        </div>
      </div>

      {/* OSC Settings */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border space-y-4">
        <h3 className="font-semibold text-white">OSC Configuration</h3>
        <p className="text-sm text-gray-400">
          Configure the OSC connection to REAPER. Default port is 8000.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Host</label>
            <input
              type="text"
              value={localHost}
              onChange={(e) => setLocalHost(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-reaper-bg border border-reaper-border focus:border-reaper-accent focus:outline-none"
              placeholder="127.0.0.1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Port</label>
            <input
              type="text"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-reaper-bg border border-reaper-border focus:border-reaper-accent focus:outline-none"
              placeholder="8000"
            />
          </div>
        </div>
      </div>

      {/* API Key (for future Claude integration) */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border space-y-4">
        <h3 className="font-semibold text-white">Anthropic API Key</h3>
        <p className="text-sm text-gray-400">
          Optional: Enter your API key for Claude-powered chat responses.
        </p>
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-reaper-bg border border-reaper-border focus:border-reaper-accent focus:outline-none"
          placeholder="sk-ant-..."
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-reaper-accent hover:bg-blue-500 transition-colors font-semibold"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
        {saved && (
          <span className="text-green-500 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Settings saved!
          </span>
        )}
      </div>

      {/* REAPER OSC Setup Instructions */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border">
        <h3 className="font-semibold text-white mb-4">REAPER OSC Setup</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
          <li>Open REAPER Preferences (Ctrl+P)</li>
          <li>Go to Control/OSC/Web</li>
          <li>Click "Add"</li>
          <li>Select "OSC (Open Sound Control)"</li>
          <li>Set Local listen port to <code className="bg-reaper-bg px-2 py-1 rounded">8000</code></li>
          <li>Set Device IP to <code className="bg-reaper-bg px-2 py-1 rounded">127.0.0.1</code></li>
          <li>Set Device port to <code className="bg-reaper-bg px-2 py-1 rounded">9000</code></li>
          <li>Click OK and restart REAPER</li>
        </ol>
      </div>
    </div>
  );
}
