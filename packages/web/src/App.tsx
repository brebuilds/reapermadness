import { useAppStore } from './stores/appStore';
import { TransportBar } from './components/Transport/TransportBar';
import { LooperDashboard } from './components/Looper/LooperDashboard';
import { ChatView } from './components/Chat/ChatView';
import { Settings } from './components/Settings/Settings';
import { Navigation } from './components/Navigation';
import { Maximize2, Minimize2 } from 'lucide-react';

function App() {
  const { currentView, performanceMode, togglePerformanceMode } = useAppStore();

  return (
    <div className="min-h-screen bg-reaper-bg flex flex-col">
      {/* Header - hidden in performance mode */}
      {!performanceMode && (
        <header className="bg-reaper-surface border-b border-reaper-border p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-reaper-accent">REAPER</span> Assistant
            </h1>
            <div className="flex items-center gap-4">
              <Navigation />
              <button
                onClick={togglePerformanceMode}
                className="p-2 rounded-lg bg-reaper-surface border border-reaper-border hover:border-reaper-accent transition-colors"
                title="Enter Performance Mode"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Performance mode header - minimal */}
      {performanceMode && (
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={togglePerformanceMode}
            className="p-2 rounded-lg bg-reaper-surface/80 border border-reaper-border hover:border-reaper-accent transition-colors"
            title="Exit Performance Mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 ${performanceMode ? 'p-2' : 'p-4'}`}>
        <div className={`${performanceMode ? '' : 'max-w-7xl mx-auto'}`}>
          {/* Transport bar - always visible */}
          <TransportBar compact={performanceMode} />

          {/* View content */}
          <div className={`${performanceMode ? 'mt-2' : 'mt-6'}`}>
            {performanceMode ? (
              // Performance mode shows only the looper
              <LooperDashboard large />
            ) : (
              // Normal mode shows selected view
              <>
                {currentView === 'dashboard' && <LooperDashboard />}
                {currentView === 'chat' && <ChatView />}
                {currentView === 'settings' && <Settings />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
