import React from 'react';
import { LayoutDashboard, KanbanSquare, Layers, Settings } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'board';
  setCurrentTab: (tab: 'dashboard' | 'board') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <aside className="w-64 h-screen glass border-r flex flex-col justify-between p-6 fixed left-0 top-0 z-20">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ZenFlow
            </h1>
            <span className="text-[10px] text-indigo-400/80 tracking-wider uppercase font-semibold">Workspace</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentTab === 'dashboard'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('board')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentTab === 'board'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <KanbanSquare className="h-5 w-5" />
            <span className="font-medium text-sm">Kanban Board</span>
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
            JD
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">John Doe</h4>
            <span className="text-[10px] text-slate-400 truncate block">Workspace Owner</span>
          </div>
        </div>

        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-400 text-xs font-medium hover:bg-white/5 transition-all">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
};
