import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { healthCheck, updateOSCConfig } from '../../api/client';
import { Save, RefreshCw, CheckCircle, XCircle, Server, AlertCircle } from 'lucide-react';

export function Settings() {
  const { serverUrl, oscHost, oscPort, apiKey, isConnected, setSettings, setConnected } = useAppStore();
  const [localServerUrl, setLocalServerUrl] = useState(serverUrl);
  const [localHost, setLocalHost] = useState(oscHost);
  const [localPort, setLocalPort] = useState(oscPort.toString());
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const port = parseInt(localPort);
    if (isNaN(port)) return;

    setSettings({
      serverUrl: localServerUrl,
      oscHost: localHost,
      oscPort: port,
      apiKey: localApiKey,
    });

    // Also update the server's OSC config if connected
    try {
      await updateOSCConfig({ host: localHost, port });
    } catch (e) {
      console.error('Failed to update server OSC config:', e);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Re-test connection after save
    testConnection(localServerUrl);
  };

  const testConnection = async (url?: string) => {
    setIsTesting(true);
    const testUrl = url || localServerUrl;

    try {
      await healthCheck(testUrl);
      setConnected(true);
    } catch (e) {
      setConnected(false);
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
        <p className="text-gray-400">Configure connection to your local REAPER server</p>
      </div>

      {/* Important Notice for Web Deployment */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-200 font-medium mb-1">Running from the web?</p>
            <p className="text-blue-300/80">
              You need to run the server on your computer to control REAPER.
              Open a terminal and run:
            </p>
            <code className="block bg-black/30 rounded px-3 py-2 mt-2 text-green-400 font-mono text-xs">
              cd reaper-assistant && pnpm install && pnpm dev:server
            </code>
            <p className="text-blue-300/80 mt-2">
              Then enter <code className="bg-black/30 px-1 rounded">http://localhost:3001</code> as the Server URL below.
            </p>
          </div>
        </div>
      </div>

      {/* Server Connection */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            Server Connection
          </h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 text-sm">
                <XCircle className="w-4 h-4" />
                Not Connected
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Server URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localServerUrl}
              onChange={(e) => setLocalServerUrl(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-reaper-bg border border-reaper-border focus:border-reaper-accent focus:outline-none font-mono"
              placeholder="http://localhost:3001"
            />
            <button
              onClick={() => testConnection(localServerUrl)}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-reaper-border hover:bg-reaper-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The URL where your REAPER Assistant server is running
          </p>
        </div>
      </div>

      {/* OSC Settings */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border space-y-4">
        <h3 className="font-semibold text-white">OSC Configuration</h3>
        <p className="text-sm text-gray-400">
          These settings are used by the server to communicate with REAPER.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">REAPER Host</label>
            <input
              type="text"
              value={localHost}
              onChange={(e) => setLocalHost(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-reaper-bg border border-reaper-border focus:border-reaper-accent focus:outline-none"
              placeholder="127.0.0.1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">REAPER OSC Port</label>
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

      {/* Setup Instructions */}
      <div className="bg-reaper-surface rounded-lg p-6 border border-reaper-border">
        <h3 className="font-semibold text-white mb-4">Quick Setup Guide</h3>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="text-reaper-accent font-medium mb-2">1. Start the Server (on your computer)</h4>
            <code className="block bg-reaper-bg px-3 py-2 rounded text-green-400 font-mono text-xs">
              cd reaper-assistant && pnpm install && pnpm dev:server
            </code>
          </div>

          <div>
            <h4 className="text-reaper-accent font-medium mb-2">2. Configure REAPER OSC</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Open REAPER Preferences (Ctrl+P)</li>
              <li>Go to Control/OSC/Web</li>
              <li>Click "Add" → "OSC"</li>
              <li>Set Local listen port to <code className="bg-reaper-bg px-2 py-0.5 rounded">8000</code></li>
              <li>Set Device port to <code className="bg-reaper-bg px-2 py-0.5 rounded">9000</code></li>
              <li>Click OK</li>
            </ol>
          </div>

          <div>
            <h4 className="text-reaper-accent font-medium mb-2">3. Connect</h4>
            <p className="text-gray-300">
              Enter <code className="bg-reaper-bg px-2 py-0.5 rounded">http://localhost:3001</code> as the Server URL above and click Test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
