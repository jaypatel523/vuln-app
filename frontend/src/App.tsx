import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'board'>('dashboard');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-[#050508] overflow-hidden grid-bg">
        {/* Animated ambient backdrop glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>

        {/* Sidebar navigation */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="pl-64 min-h-screen flex flex-col">
          {/* Top Navbar */}
          <header className="h-16 border-b border-white/5 bg-[#050508]/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Live Server Connected
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              System Time: {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </header>

          {/* Page Container */}
          <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' ? <Dashboard /> : <KanbanBoard />}
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;
