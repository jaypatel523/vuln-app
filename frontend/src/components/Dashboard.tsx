import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, Clock, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: taskApi.getStats,
    refetchInterval: 5000, // Poll every 5s
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: taskApi.getActivity,
    refetchInterval: 5000,
  });

  if (statsLoading || activityLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Loading workspace dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallbacks if data isn't fully loaded
  const total = stats?.summary.total ?? 0;
  const overdue = stats?.summary.overdue ?? 0;
  const todo = stats?.status.TODO ?? 0;
  const inProgress = stats?.status.IN_PROGRESS ?? 0;
  const review = stats?.status.REVIEW ?? 0;
  const done = stats?.status.DONE ?? 0;

  const low = stats?.priority.LOW ?? 0;
  const medium = stats?.priority.MEDIUM ?? 0;
  const high = stats?.priority.HIGH ?? 0;

  // Chart Data: Status Overview
  const statusData = [
    { name: 'To Do', value: todo },
    { name: 'In Progress', value: inProgress },
    { name: 'Review', value: review },
    { name: 'Done', value: done },
  ];

  // Chart Data: Priority Breakdown
  const priorityData = [
    { name: 'High', value: high, color: '#f43f5e' }, // Rose 500
    { name: 'Medium', value: medium, color: '#f59e0b' }, // Amber 500
    { name: 'Low', value: low, color: '#10b981' }, // Emerald 500
  ];

  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Workspace Overview
        </h2>
        <p className="text-slate-400 mt-1">
          Review overall project progress, key metrics, and activity timeline.
        </p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Tasks */}
        <div className="glass p-5 rounded-2xl glow-indigo relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Backlog</span>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">{total}</h3>
            </div>
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
              <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: total > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tasks</span>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-1.5">{inProgress}</h3>
            </div>
            <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Done */}
        <div className="glass p-5 rounded-2xl glow-purple relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">{done}</h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Deadlines</span>
              <h3 className="text-3xl font-extrabold text-rose-500 mt-1.5">{overdue}</h3>
            </div>
            <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="h-5 w-5 text-rose-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (overdue / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Line/Area Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-white">Backlog Distribution</h4>
              <span className="text-xs text-slate-400">Total volume grouped by status columns</span>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#101118', 
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'Plus Jakarta Sans'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority breakdown PieChart */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white">Task Priority</h4>
            <span className="text-xs text-slate-400">Work breakdown by urgency levels</span>
          </div>

          <div className="h-[200px] relative flex justify-center items-center">
            {total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#101118', 
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontFamily: 'Plus Jakarta Sans'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-medium">No tasks recorded</div>
            )}
            {total > 0 && (
              <div className="absolute flex flex-col justify-center items-center">
                <span className="text-3xl font-extrabold text-white">{total}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tasks</span>
              </div>
            )}
          </div>

          <div className="flex justify-around mt-4 pt-4 border-t border-white/5">
            {priorityData.map((item) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white mt-0.5">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-bold text-white">Live Activity Stream</h4>
            <span className="text-xs text-slate-400">Chronological history of workspace changes</span>
          </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {activity && activity.length > 0 ? (
            activity.map((log) => (
              <div key={log.id} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {log.action === 'CREATE_TASK' && <span className="h-2 w-2 rounded-full bg-indigo-500 block"></span>}
                    {log.action === 'UPDATE_TASK' && <span className="h-2 w-2 rounded-full bg-cyan-400 block"></span>}
                    {log.action === 'DELETE_TASK' && <span className="h-2 w-2 rounded-full bg-rose-500 block"></span>}
                    {log.action === 'SEED' && <span className="h-2 w-2 rounded-full bg-purple-500 block"></span>}
                    {!['CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'SEED'].includes(log.action) && (
                      <span className="h-2 w-2 rounded-full bg-slate-500 block"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{log.details}</p>
                    <span className="text-[10px] text-slate-400/80 font-semibold uppercase">{log.action}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{formatActivityTime(log.createdAt)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 font-medium">No activity logs recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
