import { useAppStore, View } from '../stores/appStore';
import { LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

const navItems: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Looper', icon: LayoutDashboard },
  { view: 'chat', label: 'Chat', icon: MessageSquare },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const { currentView, setView } = useAppStore();

  return (
    <nav className="flex gap-1">
      {navItems.map(({ view, label, icon: Icon }) => (
        <button
          key={view}
          onClick={() => setView(view)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors touch-target
            ${
              currentView === view
                ? 'bg-reaper-accent text-white'
                : 'bg-reaper-surface hover:bg-reaper-border text-gray-300'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}
